import express from "express";
import swaggerSpec from "./swagger.json";
import swaggerUi from "swagger-ui-express";

/**
 * @type {swaggerUi.SwaggerUiOptions}
 */
const SwaggerUIOptions = {};

/**
 * @param {express.Express} app
 */
export function initSwagger(app) {
  app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, SwaggerUIOptions),
  );
}
