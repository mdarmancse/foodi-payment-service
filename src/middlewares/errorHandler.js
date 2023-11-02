import express from "express";
import { sendError } from "helpers";
import { StatusCodes } from "http-status-codes";

/**
 * @param {Error} err
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.trace(err);
  sendError(res, {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Sorry, Something went wrong!",
  });
}
