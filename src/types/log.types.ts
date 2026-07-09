/**
 * Daily habit checklist. Grouped into one object (rather than five flat
 * booleans on DailyLogEntry) so adding a future habit is one field here,
 * not a schema change touching every place that constructs a log.
 */
export interface DailyHabits {
  workoutCompleted: boolean;
  hitWaterGoal: boolean; // 3L target
  hitProteinGoal: boolean;
  slept7PlusHours: boolean;
  reachedStepGoal: boolean; // 8,000+ steps
}

export const DEFAULT_HABITS: DailyHabits = {
  workoutCompleted: false,
  hitWaterGoal: false,
  hitProteinGoal: false,
  slept7PlusHours: false,
  reachedStepGoal: false,
};

export interface DailyLogEntry {
  id: string; // generated client-side (timestamp-based) — stable React key + lookup
  date: string; // ISO date (YYYY-MM-DD), one entry per day
  weightKg: number;
  habits: DailyHabits;
  notes: string;
  createdAt: string; // ISO timestamp of when the log was saved
}

/**
 * Input shape for creating a log entry — id/createdAt are assigned
 * by the storage layer so callers never construct ids themselves.
 */
export type DailyLogInput = Omit<DailyLogEntry, 'id' | 'createdAt'>;
