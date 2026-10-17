import { Router } from 'express';
import * as workoutController from '../controllers/workout.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { completeWorkoutSchema } from '../validators/workout.validators.js';

export const workoutRouter = Router();

workoutRouter.get('/', requireAuth, workoutController.getForDate);
workoutRouter.post('/:dayId/complete', requireAuth, validateRequest(completeWorkoutSchema), workoutController.complete);
