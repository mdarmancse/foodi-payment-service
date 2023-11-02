import express from "express";
import { StatusCodes } from "http-status-codes";

/**
 * @param {express.Response} res
 * @param {unknown} data
 */
export function sendData(res, data) {
  res.status(StatusCodes.OK).json({
    status: true,
    message: "Success",
    data,
  });
}
