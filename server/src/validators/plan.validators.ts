import { z } from 'zod';
import { WorkoutSplitStyle } from '@prisma/client';

export const generatePlanSchema = z.object({
  splitStyle: z.nativeEnum(WorkoutSplitStyle).optional(),
});
export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
