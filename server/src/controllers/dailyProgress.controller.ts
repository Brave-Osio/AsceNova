import type { Request, Response, NextFunction } from 'express';
import * as dailyProgressService from '../services/dailyProgressService.js';
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
