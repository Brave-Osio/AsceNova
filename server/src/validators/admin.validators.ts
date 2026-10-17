import { z } from 'zod';

export const updateAchievementSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  icon: z.string().trim().min(1).optional(),
  xpReward: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;

export const auditLogQuerySchema = z.object({
  actor: z.string().trim().min(1).max(100).optional(),
  action: z
    .enum(['ADMIN_LOGIN', 'ADMIN_LOGOUT', 'USER_SUSPEND', 'USER_REACTIVATE', 'USER_GRANT_ADMIN', 'USER_REVOKE_ADMIN', 'USER_DELETE', 'ACHIEVEMENT_UPDATE', 'USER_EXPORT'])
    .optional(),
  outcome: z.enum(['SUCCESS', 'FAILURE']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
