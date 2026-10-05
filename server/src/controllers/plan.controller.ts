import type { Request, Response, NextFunction } from 'express';
import * as planService from '../services/planService.js';
import type { GeneratePlanInput } from '../validators/plan.validators.js';

export async function getActive(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await planService.getActivePlan(req.user!.id);
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as GeneratePlanInput;
    const { plan, usedBackup } = await planService.generateAndSaveActivePlan(req.user!.id, input.splitStyle);
    res.status(201).json({ plan, usedBackup });
  } catch (err) {
    next(err);
  }
}
