import { httpClient } from '../lib/httpClient';
import type { UserProgress } from '../types/gamification.types';

interface ApiProgress {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  unlockedAchievementIds: string[];
}

function toUserProgress(api: ApiProgress): UserProgress {
  return {
    totalXp: api.totalXp,
    currentStreak: api.currentStreak,
    longestStreak: api.longestStreak,
    lastLogDate: api.lastLogDate ? api.lastLogDate.slice(0, 10) : null,
    unlockedAchievementIds: api.unlockedAchievementIds,
  };
}

export interface ApplyDailyLogResult {
  progress: UserProgress;
  xpGained: number;
  newAchievementTitles: string[];
}

/**
 * Thin wrapper over the progress API — mirrors authService.ts/
 * profileService.ts's "one exported function per concern" convention.
 */
export async function getProgress(): Promise<UserProgress> {
  const res = await httpClient.get<{ progress: ApiProgress }>('/api/progress');
  return toUserProgress(res.data.progress);
}

export async function applyDailyLog(date: string): Promise<ApplyDailyLogResult> {
  const res = await httpClient.post<{
    progress: ApiProgress;
    xpGained: number;
    newAchievementTitles: string[];
  }>('/api/progress/apply-log', { date });
  return {
    progress: toUserProgress(res.data.progress),
    xpGained: res.data.xpGained,
    newAchievementTitles: res.data.newAchievementTitles,
  };
}
