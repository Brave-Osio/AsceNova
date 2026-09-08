import { z } from 'zod';

export const applyDailyLogSchema = z.object({
  date: z.coerce.date(),
});
export type ApplyDailyLogInput = z.infer<typeof applyDailyLogSchema>;
