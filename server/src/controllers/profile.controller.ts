import type { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profileService.js';
import type { UpsertProfileInput } from '../validators/profile.validators.js';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfileByUserId(req.user!.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function upsertMe(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpsertProfileInput;
    const profile = await profileService.upsertProfile(req.user!.id, input);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}
