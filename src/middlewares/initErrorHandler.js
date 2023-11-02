import express from "express";
import { errorHandler } from "./errorHandler";

/**
 * @param {express.Express} app
 */
export function initErrorHandler(app) {
  app.use(errorHandler);
}
