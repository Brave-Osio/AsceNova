import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', requireAuth, leaderboardController.list);
