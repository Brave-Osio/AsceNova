import { httpClient } from '../lib/httpClient';
import type { DailyLogEntry, DailyLogInput } from '../types/log.types';

interface ApiDailyProgress {
  id: string;
  date: string;
  weightKg: number;
  workoutCompleted: boolean;
  hitWaterGoal: boolean;
  hitProteinGoal: boolean;
  slept7PlusHours: boolean;
  reachedStepGoal: boolean;
  notes: string | null;
  createdAt: string;
}

/** Mirrors the web app's src/services/logService.ts. */
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

export async function listLogs(): Promise<DailyLogEntry[]> {
  const res = await httpClient.get<{ logs: ApiDailyProgress[] }>('/api/daily-progress');
  return res.data.logs.map(toDailyLogEntry);
}

export async function upsertLog(input: DailyLogInput): Promise<DailyLogEntry> {
  const res = await httpClient.put<{ log: ApiDailyProgress }>('/api/daily-progress', toApiInput(input));
  return toDailyLogEntry(res.data.log);
}
