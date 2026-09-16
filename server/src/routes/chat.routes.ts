import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { sendMessageSchema } from '../validators/chat.validators.js';

export const chatRouter = Router();

chatRouter.get('/history', requireAuth, chatController.getHistory);
chatRouter.post('/', requireAuth, validateRequest(sendMessageSchema), chatController.sendMessage);
