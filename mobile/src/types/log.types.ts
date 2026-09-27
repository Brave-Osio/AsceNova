/** Mirrors the web app's src/types/log.types.ts. */
export interface DailyHabits {
  workoutCompleted: boolean;
  hitWaterGoal: boolean;
  hitProteinGoal: boolean;
  slept7PlusHours: boolean;
  reachedStepGoal: boolean;
}

export const DEFAULT_HABITS: DailyHabits = {
  workoutCompleted: false,
  hitWaterGoal: false,
  hitProteinGoal: false,
  slept7PlusHours: false,
  reachedStepGoal: false,
};

export interface DailyLogEntry {
  id: string;
  date: string;
  weightKg: number;
  habits: DailyHabits;
  notes: string;
  createdAt: string;
}

export type DailyLogInput = Omit<DailyLogEntry, 'id' | 'createdAt'>;
