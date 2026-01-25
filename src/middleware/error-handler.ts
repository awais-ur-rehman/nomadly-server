import { type Request, type Response, type NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const errorMessage = err?.message || "Unknown error";
  const errorStack = err?.stack || "No stack trace";

  logger.error({
    error: errorMessage,
    stack: errorStack,
    url: req.url,
    method: req.method,
  });

  // Also log to console for visibility during development
  console.error(`\n❌ [${req.method}] ${req.url}`);
  console.error(`Error Message: ${errorMessage}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(`Stack:\n${errorStack}\n`);
  }

  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  }

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : errorMessage;

  return res.status(500).json({
    status: "error",
    message,
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
