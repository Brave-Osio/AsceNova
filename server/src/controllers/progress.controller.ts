import type { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService.js';
import type { ApplyDailyLogInput } from '../validators/progress.validators.js';

export async function getMine(req: Request, res: Response, next: NextFunction) {
  try {
    const progress = await progressService.getProgress(req.user!.id);
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}

export async function applyLog(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as ApplyDailyLogInput;
    const result = await progressService.applyDailyLog(req.user!.id, input.date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
