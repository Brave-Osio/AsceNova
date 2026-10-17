import { Router } from 'express';
import type { RequestHandler } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { runRetentionPurge } from '../services/retentionService.js';

export const internalRouter = Router();

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Never reachable with a user JWT. */
const requireCronSecret: RequestHandler = (req, _res, next) => {
  if (!env.CRON_SECRET) {
    next(new HttpError(503, 'Scheduled jobs are not configured'));
    return;
  }
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const provided = Buffer.from(req.headers.authorization ?? '');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    next(new HttpError(401, 'Unauthorized'));
    return;
  }
  next();
};

internalRouter.get('/cron/retention', requireCronSecret, async (_req, res, next) => {
  try {
    res.json(await runRetentionPurge());
  } catch (err) {
    next(err);
  }
});
