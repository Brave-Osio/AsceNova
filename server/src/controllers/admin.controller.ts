import type { Request, Response, NextFunction } from 'express';
import type { AccountStatus } from '@prisma/client';
import * as adminService from '../services/adminService.js';
import type { UpdateAchievementInput } from '../validators/admin.validators.js';

const VALID_STATUSES: AccountStatus[] = ['ACTIVE', 'SUSPENDED', 'DELETED'];

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() || undefined : undefined;
    const statusParam = typeof req.query.status === 'string' ? req.query.status : undefined;
    const status = statusParam && VALID_STATUSES.includes(statusParam as AccountStatus)
      ? (statusParam as AccountStatus)
      : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

    const result = await adminService.listUsers({ search, status, page, pageSize });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUserDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await adminService.getUserDetail(req.params.id);
    res.json(detail);
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.suspendUser(req.user!.id, req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function reactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.reactivateUser(req.user!.id, req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.softDeleteUser(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function exportUsersCsv(_req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await adminService.exportUsersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function listAchievements(_req: Request, res: Response, next: NextFunction) {
  try {
    const achievements = await adminService.listAchievements();
    res.json({ achievements });
  } catch (err) {
    next(err);
  }
}

export async function updateAchievement(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateAchievementInput;
    const achievement = await adminService.updateAchievement(req.params.id, input);
    res.json({ achievement });
  } catch (err) {
    next(err);
  }
}
