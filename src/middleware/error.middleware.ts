import { AppError } from "../models/error.model.js";
import { Response, ErrorRequestHandler, Request, NextFunction } from "express";
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data: [],
      error: {
        code: err.statusCode,
        category: err.errorCategory,
        description: err.errorDescription,
      },
    });
    return;
  }
  res.status(500).json({
    success: false,
    data: [],
    error: {
      code: 500,
      category: "Internal Server Error",
      description: "Something went wrong on server side",
    },
  });
};
