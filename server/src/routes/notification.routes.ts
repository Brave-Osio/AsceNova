import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const notificationRouter = Router();

notificationRouter.get('/', requireAuth, notificationController.getRecent);
notificationRouter.get('/unread-count', requireAuth, notificationController.getUnreadCount);
notificationRouter.patch('/:id/read', requireAuth, notificationController.markAsRead);
notificationRouter.post('/read-all', requireAuth, notificationController.markAllAsRead);
