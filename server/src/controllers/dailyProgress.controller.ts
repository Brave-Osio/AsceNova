import type { Request, Response, NextFunction } from 'express';
import * as dailyProgressService from '../services/dailyProgressService.js';
import { assertDateInWindow, parseDateOnly } from '../services/workoutCompletionService.js';
import { workoutDateQuerySchema } from '../validators/workout.validators.js';
import type { UpsertDailyProgressInput } from '../validators/dailyProgress.validators.js';

export async function upsert(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpsertDailyProgressInput;
    const log = await dailyProgressService.upsertLog(req.user!.id, input);
    res.json({ log });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await dailyProgressService.listLogs(req.user!.id);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}

export async function getForDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = workoutDateQuerySchema.parse(req.query);
    const parsed = parseDateOnly(date);
    assertDateInWindow(parsed);
    res.json({ date, log: await dailyProgressService.getLogForDate(req.user!.id, parsed) });
  } catch (err) {
    next(err);
  }
}
