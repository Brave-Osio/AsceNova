import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { assignClientSchema, updateAchievementSchema } from '../validators/admin.validators.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/stats', adminController.getStats);
adminRouter.get('/ai-usage', adminController.getAiUsage);
adminRouter.get('/audit-logs', adminController.listAuditLogs); // read-only: there is deliberately no write/delete route
adminRouter.get('/users/export', adminController.exportUsersCsv); // before /:id — avoids route collision
adminRouter.get('/users/:id', adminController.getUserDetail);
adminRouter.get('/users', adminController.listUsers);
adminRouter.post('/users/:id/suspend', adminController.suspendUser);
adminRouter.post('/users/:id/reactivate', adminController.reactivateUser);
adminRouter.post('/users/:id/grant-admin', adminController.grantAdmin);
adminRouter.post('/users/:id/revoke-admin', adminController.revokeAdmin);
adminRouter.post('/users/:id/grant-coach', adminController.grantCoach);
adminRouter.post('/users/:id/revoke-coach', adminController.revokeCoach);
adminRouter.delete('/users/:id', adminController.deleteUser);
adminRouter.get('/coaches', adminController.listCoaches);
adminRouter.get('/coaches/:id/clients', adminController.listCoachClients);
adminRouter.post('/coaches/:id/clients', validateRequest(assignClientSchema), adminController.assignClient);
adminRouter.delete('/coaches/:id/clients/:clientId', adminController.unassignClient); // soft: sets the assignment inactive
adminRouter.get('/achievements', adminController.listAchievements);
adminRouter.patch('/achievements/:id', validateRequest(updateAchievementSchema), adminController.updateAchievement);
