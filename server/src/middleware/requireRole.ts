import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { HttpError } from './errorHandler.js';
import { hasAtLeastRole } from '../lib/roles.js';

/** Must run after requireAuth. Allows `minimum` and every role above it (USER < COACH < ADMIN). */
export function requireMinRole(minimum: Role): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }
    if (!hasAtLeastRole(req.user.role, minimum)) {
      next(new HttpError(403, 'You do not have permission to perform this action'));
      return;
    }
    next();
  };
}

/** Must run after requireAuth — relies on req.user being populated. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'You do not have permission to perform this action'));
      return;
    }
    next();
  };
}
