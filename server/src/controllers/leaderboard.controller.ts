import type { Request, Response, NextFunction } from 'express';
import * as leaderboardService from '../services/leaderboardService.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await leaderboardService.getLeaderboard(req.user!.id);
    res.json({ rows });
  } catch (err) {
    next(err);
  }
}
