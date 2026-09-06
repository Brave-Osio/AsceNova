import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Centralized error handler — must be registered last, after all routes.
 * Keeps controllers free of repetitive try/catch-then-status-code logic.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    return;
  }

  // Prisma unique-constraint violation (e.g. duplicate email)
  if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002') {
    res.status(409).json({ error: 'A record with this value already exists.' });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
