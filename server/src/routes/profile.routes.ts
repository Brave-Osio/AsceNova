import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { upsertProfileSchema } from '../validators/profile.validators.js';

export const profileRouter = Router();

profileRouter.get('/', requireAuth, profileController.getMe);
profileRouter.put('/', requireAuth, validateRequest(upsertProfileSchema), profileController.upsertMe);
