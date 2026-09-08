import { httpClient } from '../lib/httpClient';
import type { DailyLogEntry, DailyLogInput } from '../types/log.types';

interface ApiDailyProgress {
  id: string;
  date: string; // ISO datetime string
  weightKg: number;
  workoutCompleted: boolean;
  hitWaterGoal: boolean;
  hitProteinGoal: boolean;
  slept7PlusHours: boolean;
  reachedStepGoal: boolean;
  notes: string | null;
  createdAt: string;
}

/**
 * The backend stores habits as flat columns (matching the Prisma
 * DailyProgress model 1:1); the frontend's DailyLogEntry/DailyHabits
 * shape stays nested (the achievement engine and simulateProgressEngine
 * depend on it and aren't migrated yet) — this is the one place that
 * adapts between them, same pattern planService.ts uses for FitnessPlan.
 */
function toDailyLogEntry(row: ApiDailyProgress): DailyLogEntry {
  return {
    id: row.id,
    date: row.date.slice(0, 10),
    weightKg: row.weightKg,
    habits: {
      workoutCompleted: row.workoutCompleted,
      hitWaterGoal: row.hitWaterGoal,
      hitProteinGoal: row.hitProteinGoal,
      slept7PlusHours: row.slept7PlusHours,
      reachedStepGoal: row.reachedStepGoal,
    },
    notes: row.notes ?? '',
    createdAt: row.createdAt,
  };
}

function toApiInput(input: DailyLogInput) {
  return {
    date: input.date,
    weightKg: input.weightKg,
    workoutCompleted: input.habits.workoutCompleted,
    hitWaterGoal: input.habits.hitWaterGoal,
    hitProteinGoal: input.habits.hitProteinGoal,
    slept7PlusHours: input.habits.slept7PlusHours,
    reachedStepGoal: input.habits.reachedStepGoal,
    notes: input.notes,
  };
}

/**
 * Thin wrapper over the daily-progress API — mirrors authService.ts/
 * profileService.ts's "one exported function per concern" convention.
 */
export async function listLogs(): Promise<DailyLogEntry[]> {
  const res = await httpClient.get<{ logs: ApiDailyProgress[] }>('/api/daily-progress');
  return res.data.logs.map(toDailyLogEntry);
}

export async function upsertLog(input: DailyLogInput): Promise<DailyLogEntry> {
  const res = await httpClient.put<{ log: ApiDailyProgress }>('/api/daily-progress', toApiInput(input));
  return toDailyLogEntry(res.data.log);
}
