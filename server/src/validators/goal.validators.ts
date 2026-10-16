import { z } from 'zod';

const goalTypeEnum = z.enum(['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTAIN_WEIGHT']);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Every goal type targets body weight in kg, so the target uses realistic weight bounds (same as DailyProgress). */
const targetValueSchema = z
  .number()
  .min(30, 'Target value must be between 30 and 300 kg')
  .max(300, 'Target value must be between 30 and 300 kg');

/**
 * A target date must parse and not be in the past. The cutoff is one day
 * before the server's UTC midnight so a user whose local "today" is still
 * yesterday in UTC (US timezones in the evening) is not wrongly rejected.
 */
const targetDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Target date must be a valid date')
  .refine((value) => {
    const startOfUtcToday = Math.floor(Date.now() / DAY_MS) * DAY_MS;
    return Date.parse(value) >= startOfUtcToday - DAY_MS;
  }, 'Target date cannot be in the past');

export const createGoalSchema = z.object({
  goalType: goalTypeEnum,
  targetValue: targetValueSchema.optional(),
  targetDate: targetDateSchema.optional(),
  progressNote: z.string().trim().max(1000).optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = z.object({
  targetValue: targetValueSchema.optional(),
  targetDate: targetDateSchema.optional(),
  progressNote: z.string().trim().max(1000).optional(),
});
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
