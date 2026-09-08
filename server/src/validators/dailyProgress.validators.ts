import { z } from 'zod';

export const upsertDailyProgressSchema = z.object({
  date: z.coerce.date(),
  weightKg: z.coerce.number().min(30, 'Weight must be between 30 and 300 kg').max(300, 'Weight must be between 30 and 300 kg'),
  workoutCompleted: z.boolean().default(false),
  hitWaterGoal: z.boolean().default(false),
  hitProteinGoal: z.boolean().default(false),
  slept7PlusHours: z.boolean().default(false),
  reachedStepGoal: z.boolean().default(false),
  notes: z.string().trim().optional(),
});
export type UpsertDailyProgressInput = z.infer<typeof upsertDailyProgressSchema>;
