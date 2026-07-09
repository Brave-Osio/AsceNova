import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getProgress, saveProgress } from '../storage/userProgressStorage';
import { addXp } from '../engines/xpEngine';
import { getRankForXp, getNextRankThreshold, getRankProgress } from '../engines/rankEngine';
import { calculateStreak } from '../engines/streakEngine';
import { evaluateAchievements } from '../engines/achievementEngine';
import { unlockAchievement, getAchievements, saveAchievements } from '../storage/achievementStorage';
import { getLogs } from '../storage/logStorage';
import type { UserProgress, XpGainEvent, RankName } from '../types/gamification.types';
import type { RankThreshold } from '../constants/ranks';

interface UserProgressContextValue {
  progress: UserProgress;
  rank: RankName;
  nextRankThreshold: RankThreshold | null;
  rankProgress: number; // 0-1 fraction toward next rank
  unlockedAchievementIds: string[];
  /** Adds XP and persists immediately. Returns the updated progress. */
  gainXp: (event: XpGainEvent) => UserProgress;
  /** Records a new log date, recalculating streak, and persists. */
  recordLogDate: (dateString: string) => UserProgress;
  /** Re-evaluates achievement rules against current progress + logs, unlocking and awarding XP for any new ones. */
  checkAchievements: () => string[];
  /**
   * Replaces progress and unlocked achievements wholesale and persists.
   * Used by Simulate Progress, which computes a final state via the
   * pure simulateProgressEngine and needs to apply it directly rather
   * than replaying it through gainXp/recordLogDate (which are designed
   * for single real-time increments, not bulk-applying a precomputed result).
   */
  setProgressDirectly: (next: UserProgress) => void;
}

const UserProgressContext = createContext<UserProgressContextValue | null>(null);

/**
 * This context is intentionally the ONLY global state in the app
 * (per the Phase 1 decision to keep state management simple — React
 * Context only, no Zustand/Redux). It exists because XP/rank/streak
 * are read by multiple unrelated parts of the UI (Dashboard, navbar
 * badge later, Leaderboard's "you" row, Daily Log after submitting) —
 * everything else stays local to its own feature.
 *
 * Every mutating method here both updates in-memory state AND calls
 * the storage layer in the same call, so a page refresh never loses
 * data and components never need to remember to persist manually.
 */
export function UserProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => getProgress());
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>(() =>
    getAchievements(),
  );

  const gainXp = useCallback((event: XpGainEvent): UserProgress => {
    let updated!: UserProgress;
    setProgress((current) => {
      updated = addXp(current, event);
      saveProgress(updated);
      return updated;
    });
    return updated;
  }, []);

  const recordLogDate = useCallback((dateString: string): UserProgress => {
    let updated!: UserProgress;
    setProgress((current) => {
      updated = calculateStreak(current, dateString);
      saveProgress(updated);
      return updated;
    });
    return updated;
  }, []);

  const checkAchievements = useCallback((): string[] => {
    const logs = getLogs();
    let newlyUnlocked: string[] = [];

    setProgress((current) => {
      newlyUnlocked = evaluateAchievements(current, logs);
      if (newlyUnlocked.length === 0) return current;

      let updatedIds = current.unlockedAchievementIds;
      for (const id of newlyUnlocked) {
        updatedIds = unlockAchievement(id);
      }
      setUnlockedAchievementIds(updatedIds);

      const xpGain = newlyUnlocked.length * 100; // matches XP_REWARDS.achievementUnlock
      const updatedProgress: UserProgress = {
        ...current,
        totalXp: current.totalXp + xpGain,
        unlockedAchievementIds: updatedIds,
      };
      saveProgress(updatedProgress);
      return updatedProgress;
    });

    return newlyUnlocked;
  }, []);

  const setProgressDirectly = useCallback((next: UserProgress) => {
    setProgress(next);
    saveProgress(next);
    setUnlockedAchievementIds(next.unlockedAchievementIds);
    saveAchievements(next.unlockedAchievementIds);
  }, []);

  const value: UserProgressContextValue = {
    progress,
    rank: getRankForXp(progress.totalXp),
    nextRankThreshold: getNextRankThreshold(progress.totalXp),
    rankProgress: getRankProgress(progress.totalXp),
    unlockedAchievementIds,
    gainXp,
    recordLogDate,
    checkAchievements,
    setProgressDirectly,
  };

  return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
}

export function useUserProgress(): UserProgressContextValue {
  const ctx = useContext(UserProgressContext);
  if (!ctx) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return ctx;
}
