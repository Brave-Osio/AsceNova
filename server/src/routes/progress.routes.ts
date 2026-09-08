import { Router } from 'express';
import * as progressController from '../controllers/progress.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { applyDailyLogSchema } from '../validators/progress.validators.js';

export const progressRouter = Router();

progressRouter.get('/', requireAuth, progressController.getMine);
progressRouter.post(
  '/apply-log',
  requireAuth,
  validateRequest(applyDailyLogSchema),
  progressController.applyLog,
);
