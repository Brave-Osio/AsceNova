import type { Request, Response, NextFunction } from 'express';
import type { AccountStatus, Role } from '@prisma/client';
import * as adminService from '../services/adminService.js';
import * as aiUsageService from '../services/aiUsageService.js';
import * as auditService from '../services/auditService.js';
import { auditLogQuerySchema, type AssignClientInput, type UpdateAchievementInput } from '../validators/admin.validators.js';

const VALID_STATUSES: AccountStatus[] = ['ACTIVE', 'SUSPENDED', 'DELETED'];
const VALID_ROLES: Role[] = ['USER', 'COACH', 'ADMIN'];

function adminCtx(req: Request) {
  return { actorId: req.user!.id, requestId: req.requestId };
}

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
    const roleParam = typeof req.query.role === 'string' ? req.query.role : undefined;
    const role = roleParam && VALID_ROLES.includes(roleParam as Role) ? (roleParam as Role) : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

    const result = await adminService.listUsers({ search, status, role, page, pageSize });
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
    const user = await adminService.suspendUser(adminCtx(req), req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function reactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.reactivateUser(adminCtx(req), req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function grantAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.setUserRole(adminCtx(req), req.params.id, 'ADMIN');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function revokeAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.setUserRole(adminCtx(req), req.params.id, 'USER');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function grantCoach(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.setUserRole(adminCtx(req), req.params.id, 'COACH');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function revokeCoach(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await adminService.revokeCoach(adminCtx(req), req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function listCoaches(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.listCoaches());
  } catch (err) {
    next(err);
  }
}

export async function listCoachClients(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await adminService.listCoachClients(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function assignClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientId } = req.body as AssignClientInput;
    const assignment = await adminService.assignClient(adminCtx(req), req.params.id, clientId);
    res.json({ assignment });
  } catch (err) {
    next(err);
  }
}

export async function unassignClient(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await adminService.unassignClient(adminCtx(req), req.params.id, req.params.clientId);
    res.json({ assignment });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.softDeleteUser(adminCtx(req), req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function exportUsersCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await adminService.exportUsersCsv(adminCtx(req));
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
    const achievement = await adminService.updateAchievement(adminCtx(req), req.params.id, input);
    res.json({ achievement });
  } catch (err) {
    next(err);
  }
}

export async function getAiUsage(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await aiUsageService.getAiUsage());
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const query = auditLogQuerySchema.parse(req.query);
    res.json(await auditService.listAuditLogs(query));
  } catch (err) {
    next(err);
  }
}
