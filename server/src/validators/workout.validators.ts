import { z } from 'zod';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const workoutDateQuerySchema = z.object({ date: dateOnly });
export type WorkoutDateQuery = z.infer<typeof workoutDateQuerySchema>;

export const completeWorkoutSchema = z.object({ date: dateOnly });
export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
