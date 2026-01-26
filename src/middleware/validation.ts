import { type Request, type Response, type NextFunction } from "express";
import { type AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../utils/errors";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // RICH DEBUG LOGGING FOR USER
        console.error("\n❌ VALIDATION ERROR DETECTED ❌");
        console.error(`Endpoint: [${req.method}] ${req.originalUrl}`);
        console.error("Request Body:", JSON.stringify(req.body, null, 2));
        console.error("Zod Issues:", JSON.stringify(error.errors, null, 2));

        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(new ValidationError("Validation failed", errors));
      } else {
        next(error);
      }
    }
  };
};
