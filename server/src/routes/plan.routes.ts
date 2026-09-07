import { Router } from 'express';
import * as planController from '../controllers/plan.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { generatePlanSchema } from '../validators/plan.validators.js';

export const planRouter = Router();

planRouter.get('/active', requireAuth, planController.getActive);
planRouter.post('/', requireAuth, validateRequest(generatePlanSchema), planController.generate);
