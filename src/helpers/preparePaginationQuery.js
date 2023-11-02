import express from "express";
import mongoose from "mongoose";
import { isEmpty } from "lodash";
import { PaginationConfig } from "./pagination.config";

/**
 * @typedef {mongoose.FilterQuery<unknown>} GenericQuery
 */

/**
 * Custom filter query factory.
 * Function that will take in the request instance and
 * return a mongoose query to filter entries.
 *
 * @callback FilterFactory
 * @param {express.Request} req - Express request instance
 * @returns {Array<GenericQuery> | Promise<Array<GenericQuery>>} - An array of objects that can be directly used in the
 * mongoose find query with AND type operator
 */

/**
 * Custom search query factory.
 * Function that will take in the request instance and
 * return a mongoose query to apply search.
 *
 * @callback SearchFactory
 * @param {string} searchTerm - Non-empty search term string
 * @returns {Array<GenericQuery> | Promise<Array<GenericQuery>>} - An array of objects that can be directly used in the
 * mongoose find query with OR type operator
 */

/**
 * Pagination options
 *
 * @typedef PaginationOptions
 * @property {Array<GenericQuery>} [queries] - Optional fixed queries that will be used
 * will all queries
 * @property {Array<string>} [filterables] - Array of field names that are filterable
 * @property {FilterFactory} [getFilterQueries] - Factory function to be used to generate
 * custom filters from the incoming request
 * @property {Array<string>} [sortables] - Array of field names that are sortable
 * @property {Array<string>} [searchables] - Array of field names that are searchables
 * @property {SearchFactory} [getSearchQueries] - Factory function to be used to generate
 * custom query to apply search
 */

/**
 * Prepared parts of the pagination query
 *
 * @typedef PreparedQuery
 * @property {GenericQuery} query - Query object to be used in mongoose pagination
 * @property {number} page - Requested page number
 * @property {number} limit - Page size
 * @property {Object} sort - Sort order
 */

/**
 * Prepare pagination query from the request params
 *
 * By default all searchable fields will be search with regex, if you want to
 * perform different search operation use getSearchQuery option to build the
 * search query.
 *
 * @param {express.Request} req - Express request instance
 * @param {PaginationOptions} [options] - Options to be used for parsing request
 * @returns {Promise<PreparedQuery>} - Returns parsed and prepared object
 */
export const preparePaginationQuery = async (req, options) => {
  /** @type {PaginationOptions} */
  const {
    queries = [],
    filterables = [],
    getFilterQueries,
    searchables = [],
    getSearchQueries,
    sortables = [],
  } = options || {};

  /**
   * @type {PreparedQuery}
   */
  let rv = {};

  // collect filter query
  /** @type {GenericQuery[]} */
  let filterQueries = [];
  if (getFilterQueries) {
    filterQueries = await Promise.resolve(getFilterQueries(req));
  } else {
    for (const filterable of filterables) {
      if (req.query[filterable]) {
        filterQueries.push({
          [filterable]: req.query[filterable],
        });
      }
    }
  }

  // collect search query
  /** @type {GenericQuery[]} */
  let searchQueries = [];
  const searchTerm = /** @type {string} */ (req.query.search) || "";
  if (searchTerm) {
    if (getSearchQueries) {
      searchQueries = await Promise.resolve(getSearchQueries(searchTerm));
    } else {
      for (const searchable of searchables) {
        searchQueries.push({
          [searchable]: {
            $regex: searchTerm,
            $options: "i",
          },
        });
      }
    }
  }

  // combine filter and search queries
  const hasSearch = !isEmpty(searchQueries);
  rv.query = {
    $and: [
      ...queries,
      ...filterQueries,
      ...(hasSearch
        ? [
            {
              $or: searchQueries,
            },
          ]
        : []),
    ],
  };
  if (isEmpty(rv.query.$and)) {
    rv.query = {};
  }

  // parse page and page size
  rv.page = Math.max(
    parseInt(/** @type {string} */ (req.query.page) || "1"),
    1,
  );
  rv.limit = Math.min(
    Math.max(
      parseInt(
        /** @type {string} */ (req.query.limit) ||
          `${PaginationConfig.DEFAULT_PAGE_SIZE}`,
      ),
      PaginationConfig.MIN_PAGE_SIZE,
    ),
    PaginationConfig.MAX_PAGE_SIZE,
  );

  // parse sorting params
  const sortBy = /** @type {string} */ (req.query.sortBy);
  let sort = {};
  if (sortBy && sortables.some((s) => s === sortBy)) {
    let sortOrder = `${
      req.query.sortOrder || PaginationConfig.ASC
    }`.toLowerCase();
    if (
      ![PaginationConfig.ASC, PaginationConfig.DESC].some(
        (o) => o === sortOrder,
      )
    ) {
      sortOrder = PaginationConfig.ASC;
    }

    sort = {
      [sortBy]: sortOrder,
    };
  }
  rv.sort = sort;

  return rv;
};
