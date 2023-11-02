import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initSwagger } from "./initSwagger";

/**
 * @param {express.Express} app
 */
export function initGlobalMiddlewares(app) {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  initSwagger(app);
}
