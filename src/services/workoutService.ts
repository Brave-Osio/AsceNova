import { httpClient } from '../lib/httpClient';
import type { CompleteWorkoutResult, WorkoutForDate } from '../types/workout.types';

/** One exported function per concern, like logService.ts. `date` is the user's local calendar day (YYYY-MM-DD). */
export async function getWorkoutForDate(date: string): Promise<WorkoutForDate> {
  const res = await httpClient.get<WorkoutForDate>('/api/workouts', { params: { date } });
  return res.data;
}

export async function completeWorkout(workoutDayId: string, date: string): Promise<CompleteWorkoutResult> {
  const res = await httpClient.post<CompleteWorkoutResult>(`/api/workouts/${workoutDayId}/complete`, { date });
  return res.data;
}
