import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prismaClient.js';
import { HttpError } from './errorHandler.js';

/**
 * Verifies the access token AND re-checks the user's current status on
 * every request (one indexed lookup). Access tokens are stateless and
 * can't be individually revoked mid-flight, so without this check a
 * suspension would only take effect once the 15-minute token expires.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Missing or malformed Authorization header');
    }

    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, deleted: true },
    });

    if (!user || user.deleted || user.status !== 'ACTIVE') {
      throw new HttpError(401, 'Account is not active');
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    if (err instanceof HttpError) {
      next(err);
    } else {
      next(new HttpError(401, 'Invalid or expired access token'));
    }
  }
};
