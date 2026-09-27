import { z } from 'zod';

export const updateAchievementSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  icon: z.string().trim().min(1).optional(),
  xpReward: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;
