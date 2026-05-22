import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const successResponse = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = StatusCodes.OK
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  errors: unknown = null,
  statusCode = StatusCodes.BAD_REQUEST
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
