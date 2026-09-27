import { z } from 'zod';

const goalTypeEnum = z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTAIN_WEIGHT']);

export const createGoalSchema = z.object({
  goalType: goalTypeEnum,
  targetValue: z.number().positive().optional(),
  targetDate: z.string().trim().optional(),
  progressNote: z.string().trim().max(1000).optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  targetValue: z.number().positive().optional(),
  targetDate: z.string().trim().optional(),
  progressNote: z.string().trim().max(1000).optional(),
});
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
