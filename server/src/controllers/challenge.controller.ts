import type { Request, Response, NextFunction } from 'express';
import * as challengeService from '../services/challengeService.js';
import type { CreateChallengeInviteInput, RespondToChallengeInviteInput } from '../validators/challenge.validators.js';

export async function getCatalog(_req: Request, res: Response, next: NextFunction) {
  try {
    const challenges = await challengeService.getCatalog();
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
}

export async function getMyChallenges(req: Request, res: Response, next: NextFunction) {
  try {
    const invites = await challengeService.getMyChallenges(req.user!.id);
    res.json({ invites });
  } catch (err) {
    next(err);
  }
}

export async function createInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateChallengeInviteInput;
    const invite = await challengeService.createInvite(req.user!.id, input.challengeId, input.inviteeUsernames);
    res.status(201).json({ invite });
  } catch (err) {
    next(err);
  }
}

export async function respondToInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as RespondToChallengeInviteInput;
    await challengeService.respondToInvite(req.user!.id, req.params.inviteId, input.accept);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
