import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

export const helloWorld = asyncHandler(async (req, res) => {

  console.log(req.body);
  
  const { name = "Bangladesh" } = req.query;
  res.status(StatusCodes.OK).json({ greetings: `Hello, ${name}!` });
});
