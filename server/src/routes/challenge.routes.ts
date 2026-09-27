import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createChallengeInviteSchema, respondToChallengeInviteSchema } from '../validators/challenge.validators.js';

export const challengeRouter = Router();

challengeRouter.use(requireAuth);

challengeRouter.get('/catalog', challengeController.getCatalog);
challengeRouter.get('/mine', challengeController.getMyChallenges);
challengeRouter.post('/', validateRequest(createChallengeInviteSchema), challengeController.createInvite);
challengeRouter.post(
  '/:inviteId/respond',
  validateRequest(respondToChallengeInviteSchema),
  challengeController.respondToInvite,
);
