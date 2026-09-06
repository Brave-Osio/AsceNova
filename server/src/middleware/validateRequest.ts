import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

/** Validates+coerces req.body against a Zod schema; replaces req.body with the parsed result. */
export function validateRequest(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };
}
