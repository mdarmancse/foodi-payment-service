import express from "express";
import { z } from "zod";
import { formatZodError } from "./formatZodError";
import { StatusCodes } from "http-status-codes";
import { sendError } from "helpers";

/**
 * @param {z.ZodSchema} schema
 */
export function validateQuery(schema) {
  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction} next
   */
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const errors = formatZodError(parsed.error);
      sendError(res, { data: errors });
      return;
    }
    req.query = parsed.data;
    next();
  };
}
