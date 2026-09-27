import { Router } from 'express';
import * as goalController from '../controllers/goal.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createGoalSchema, updateGoalSchema } from '../validators/goal.validators.js';

export const goalRouter = Router();

goalRouter.use(requireAuth);

goalRouter.get('/', goalController.list);
goalRouter.post('/', validateRequest(createGoalSchema), goalController.create);
goalRouter.patch('/:id', validateRequest(updateGoalSchema), goalController.update);
goalRouter.post('/:id/complete', goalController.complete);
goalRouter.post('/:id/abandon', goalController.abandon);
