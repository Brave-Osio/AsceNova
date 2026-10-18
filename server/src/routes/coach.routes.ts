import { Router } from 'express';
import * as coachController from '../controllers/coach.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireMinRole } from '../middleware/requireRole.js';

// Read-only. COACH sees assigned clients, ADMIN sees everyone (enforced in coachingService).
export const coachRouter = Router();

coachRouter.use(requireAuth, requireMinRole('COACH'));

coachRouter.get('/clients', coachController.listClients);
coachRouter.get('/clients/:id/dashboard', coachController.getClientDashboard);
