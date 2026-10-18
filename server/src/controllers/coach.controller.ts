import type { Request, Response, NextFunction } from 'express';
import * as coachingService from '../services/coachingService.js';

function coachCtx(req: Request) {
  return { actorId: req.user!.id, role: req.user!.role, requestId: req.requestId };
}

export async function listClients(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() || undefined : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    res.json(await coachingService.listClients(coachCtx(req), { search, page, pageSize }));
  } catch (err) {
    next(err);
  }
}

export async function getClientDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await coachingService.getClientDashboard(coachCtx(req), req.params.id));
  } catch (err) {
    next(err);
  }
}
