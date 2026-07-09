import { useState } from 'react';
import { simulateProgress } from '../../../engines/simulateProgressEngine';
import { saveLog, getLogs } from '../../../storage/logStorage';
import { useUserProgress } from '../../../context/UserProgressContext';
import { ACHIEVEMENTS } from '../../../constants/achievements';

export interface SimulationSummary {
  daysSimulated: number;
  xpGained: number;
  newAchievementTitles: string[];
}

export function useSimulateProgress() {
  const { progress, setProgressDirectly } = useUserProgress();

  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationSummary | null>(null);

  async function simulate(days: number) {
    try {
      setIsSimulating(true);

      const validDays =
        typeof days === 'number' && !Number.isNaN(days) && days > 0
          ? days
          : 45;

      const existingLogs = getLogs();

      const dayResults = simulateProgress(
        progress,
        existingLogs,
        validDays,
      );

      if (!dayResults || dayResults.length === 0) {
        console.warn('Simulation returned no results');
        setIsSimulating(false);
        return;
      }

      dayResults.forEach((result) => {
        saveLog({
          date: result.date,
          weightKg: result.weightKg,
          habits: result.habits,
          notes: 'Simulated entry',
        });
      });

      const startXp = progress.totalXp;

      const lastDay = dayResults[dayResults.length - 1];

      if (!lastDay || !lastDay.progress) {
        console.error('Last simulation result is invalid');
        setIsSimulating(false);
        return;
      }

      const finalProgress = lastDay.progress;

      setProgressDirectly(finalProgress);

      const allNewIds = dayResults.flatMap(
        (r) => r.newlyUnlockedAchievementIds,
      );

      const newAchievementTitles = allNewIds.map(
        (id) =>
          ACHIEVEMENTS.find((a) => a.id === id)?.title ?? id,
      );

      setLastResult({
        daysSimulated: validDays,
        xpGained: finalProgress.totalXp - startXp,
        newAchievementTitles,
      });
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  }

  return {
    simulate,
    isSimulating,
    lastResult,
  };
}