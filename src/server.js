import { initRoutes } from "controllers";
import express from "express";
import { initErrorHandler, initGlobalMiddlewares } from "middlewares";
import connectMongoDB from "mongo";

export async function runServer() {
  // connect to db
  connectMongoDB().then(() => {
    const app = express();
    const port = process.env.PORT || 3333;

    // add global middlewares
    initGlobalMiddlewares(app);

    // initialize routes
    initRoutes(app);

    // initialize global error handler
    initErrorHandler(app);

    app.listen(port, () => {
      console.log(`Running server at ${port} port`);
    });
  });
}
