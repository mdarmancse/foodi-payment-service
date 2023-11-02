// @ts-nocheck
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { pick } from "lodash";
import { sendError } from "../helpers";

function unauthorizedResponse(res) {
  sendError(res, { status: StatusCodes.UNAUTHORIZED, message: "Unauthorized" });
}

export const authenticate = asyncHandler((req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.split(" ")[1];

  if (!token) {
    unauthorizedResponse(res);
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "");
    req.user = pick(payload, ["id"]);
    next();
  } catch (_) {
    unauthorizedResponse(res);
    return;
  }
});
