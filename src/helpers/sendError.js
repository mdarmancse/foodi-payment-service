import express from "express";
import { StatusCodes } from "http-status-codes";

/**
 * @typedef {Object} ErrorResponse
 * @property {number} [status]
 * @property {string} [message]
 * @property {unknown} [data]
 */

/**
 * @param {express.Response} res
 * @param {ErrorResponse} options
 */
export function sendError(res, options) {
  const { status, ...rest } = options;
  res.status(options.status || StatusCodes.BAD_REQUEST).json({
    status: false,
    message: "Invalid data",
    data: null,
    ...rest,
  });
}
