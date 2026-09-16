import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { generateSyntheticDays } from '../../../engines/simulateProgressEngine';
import { upsertLog } from '../../../services/logService';
import { applyDailyLog } from '../../../services/progressService';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '../../../context/AuthContext';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast } from '../../../lib/toast';
import type { UserProgress } from '../../../types/gamification.types';

export interface SimulationSummary {
  daysSimulated: number;
  xpGained: number;
  newAchievementTitles: string[];
}

/**
 * Replays `days` synthetic days through the REAL backend pipeline
 * (upsertLog then applyDailyLog, sequentially) instead of computing a
 * final state locally — slower (one round-trip pair per day) but
 * provably identical to what a real user's history would produce, with
 * no separate copy of the gamification math to keep in sync with the
 * real path.
 */
export function useSimulateProgress() {
  const { user } = useAuth();
  const { progress } = useUserProgress();
  const queryClient = useQueryClient();

  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationSummary | null>(null);

  async function simulate(days: number) {
    const validDays = typeof days === 'number' && !Number.isNaN(days) && days > 0 ? days : 45;

    setIsSimulating(true);
    try {
      const syntheticDays = generateSyntheticDays(progress.lastLogDate, validDays);

      let xpGained = 0;
      const newAchievementTitles: string[] = [];
      let latestProgress: UserProgress = progress;

      for (const day of syntheticDays) {
        await upsertLog({
          date: day.date,
          weightKg: day.weightKg,
          habits: day.habits,
          notes: 'Simulated entry',
        });
        const result = await applyDailyLog(day.date);
        xpGained += result.xpGained;
        newAchievementTitles.push(...result.newAchievementTitles);
        latestProgress = result.progress;
      }

      if (user) {
        queryClient.setQueryData(queryKeys.progress.detail(user.id), latestProgress);
        queryClient.invalidateQueries({ queryKey: queryKeys.logs.list(user.id) });
        // Each simulated day runs through the real applyDailyLog, which may
        // have persisted RANK_UP/ACHIEVEMENT notifications — refresh the bell.
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(user.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(user.id) });
      }

      setLastResult({ daysSimulated: validDays, xpGained, newAchievementTitles });
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSimulating(false);
    }
  }

  return { simulate, isSimulating, lastResult };
}
