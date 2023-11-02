// @ts-nocheck
import asyncHandler from "express-async-handler";
import express, { Router } from "express";
import { authenticate } from "middlewares/authenticate";
import { initRefund, initSSL, ipnSSL } from "./sslController";
import { validateBody } from "../middlewares/validateBody";
import { paymentBodySchema } from "validators/paymentBodySchema";
import { initUSB, ipn } from "./usbController";
import { refundBodySchema } from "validators/refundBodySchema";

/**
 * @param {express.Express} app
 */

export function initRoutes(app) {
  const router = Router();

  //SSLCommerz Payment

  router.post(
    "/ssl/init/order",
    authenticate,
    validateBody(paymentBodySchema.omit({ channel: true, cardType: true })),
    asyncHandler(async (req, res) => {
      await initSSL("ORDER", req, res);
    }),
  );

  router.post(
    "/ssl/init/subscription",
    authenticate,
    validateBody(paymentBodySchema.omit({ channel: true, cardType: true })),
    asyncHandler(async (req, res) => {
      await initSSL("SUBSCRIPTION", req, res);
    }),
  );

  router.post(
    "/ssl/init/refund",
    authenticate,
    validateBody(refundBodySchema),
    asyncHandler(async (req, res) => {
      await initRefund("REFUND", req, res);
    }),
    
  );

  router.post("/ssl/ipn", ipnSSL);

  
  //USB Payment

  router.post(
    "/usb/init/order",
    authenticate,
    validateBody(paymentBodySchema),
    asyncHandler(async (req, res) => {
      await initUSB("ORDER", req, res);
    }),
  );
  router.post(
    "/usb/init/subscription",
    authenticate,
    validateBody(paymentBodySchema),
    asyncHandler(async (req, res) => {
      await initUSB("SUBSCRIPTION", req, res);
    }),
  );
  router.post(
    "/usb/init/refund",
    authenticate,
    validateBody(paymentBodySchema),
    asyncHandler(async (req, res) => {
      await initSSL("REFUND", req, res);
    }),
  );
  router.post("/ipn", ipn);

  app.use(router);
}
