import { Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";
import { filterXSS } from "xss";

/**
 * Recursively sanitize all string values in an object to prevent XSS attacks.
 */
const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return filterXSS(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === "object") {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

/**
 * XSS sanitization middleware - strips malicious HTML/JS from all inputs.
 */
export const xssSanitize = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * NoSQL injection prevention - removes $ and . from keys in request data.
 */
export const noSqlSanitize = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }: { req: Request; key: string }) => {
    console.warn(
      `[SECURITY] NoSQL injection attempt blocked on ${req.method} ${req.path} (key: ${key})`
    );
  },
});
