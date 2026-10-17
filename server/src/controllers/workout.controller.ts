import type { Request, Response, NextFunction } from 'express';
import * as workoutCompletionService from '../services/workoutCompletionService.js';
import { workoutDateQuerySchema, type CompleteWorkoutInput } from '../validators/workout.validators.js';

export async function getForDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = workoutDateQuerySchema.parse(req.query);
    res.json(await workoutCompletionService.getWorkoutForDate(req.user!.id, date));
  } catch (err) {
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.body as CompleteWorkoutInput;
    // Only the id of the day comes from the URL; the user is always the authenticated one.
    res.json(await workoutCompletionService.completeWorkout(req.user!.id, req.params.dayId, date));
  } catch (err) {
    next(err);
  }
}
