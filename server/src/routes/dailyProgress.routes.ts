import { Router } from 'express';
import * as dailyProgressController from '../controllers/dailyProgress.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { upsertDailyProgressSchema } from '../validators/dailyProgress.validators.js';

export const dailyProgressRouter = Router();

dailyProgressRouter.get('/', requireAuth, dailyProgressController.list);
dailyProgressRouter.put(
  '/',
  requireAuth,
  validateRequest(upsertDailyProgressSchema),
  dailyProgressController.upsert,
);
