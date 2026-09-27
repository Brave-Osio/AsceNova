import type { Request, Response, NextFunction } from 'express';
import * as goalService from '../services/goalService.js';
import type { CreateGoalInput, UpdateGoalInput } from '../validators/goal.validators.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const goals = await goalService.listGoals(req.user!.id);
    res.json({ goals });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateGoalInput;
    const goal = await goalService.createGoal(req.user!.id, input);
    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateGoalInput;
    await goalService.updateGoal(req.user!.id, req.params.id, input);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await goalService.completeGoal(req.user!.id, req.params.id);
    res.json({ goal });
  } catch (err) {
    next(err);
  }
}

export async function abandon(req: Request, res: Response, next: NextFunction) {
  try {
    await goalService.abandonGoal(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
