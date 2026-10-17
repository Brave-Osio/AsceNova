import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

/** Correlation id for audit records and support: honours a sane inbound X-Request-Id, else mints one. */
export const requestId: RequestHandler = (req, res, next) => {
  const inbound = req.headers['x-request-id'];
  const id = typeof inbound === 'string' && /^[A-Za-z0-9._-]{8,64}$/.test(inbound) ? inbound : randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
};
