import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { upsertLog } from '../../../services/logService';
import { applyDailyLog } from '../../../services/progressService';
import { queryKeys } from '../../../lib/queryKeys';
import { getTodayDateString } from '../../../utils/dateUtils';
import { validateNumberInRange } from '../../../utils/validation';
import { getErrorMessage } from '../../../lib/errors';
import { DEFAULT_HABITS, type DailyHabits, type DailyLogEntry } from '../../../types/log.types';

export interface DailyLogFormState {
  weightKg: string;
  habits: DailyHabits;
  notes: string;
}

export interface SubmitResult {
  xpGained: number;
  newAchievementTitles: string[];
}

const INITIAL_STATE: DailyLogFormState = { weightKg: '', habits: DEFAULT_HABITS, notes: '' };

/**
 * Mirrors the web app's useDailyLog.ts — same upsertLog -> applyDailyLog
 * pipeline. No confetti here (canvas-confetti has no RN equivalent
 * installed yet) — the XP/achievement result card below still shows.
 */
export function useDailyLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DailyLogFormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof DailyLogFormState>(field: K, value: DailyLogFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleHabit(habit: keyof DailyHabits, checked: boolean) {
    setForm((prev) => ({ ...prev, habits: { ...prev.habits, [habit]: checked } }));
  }

  async function handleSubmit() {
    const weightError = validateNumberInRange(Number(form.weightKg), 30, 300, 'Weight (kg)');
    if (weightError) {
      setError(weightError);
      return;
    }
    setError(null);

    const today = getTodayDateString();
    const input = { date: today, weightKg: Number(form.weightKg), habits: form.habits, notes: form.notes.trim() };

    setIsSubmitting(true);
    try {
      const saved = await upsertLog(input);
      if (user) {
        queryClient.setQueryData(queryKeys.logs.list(user.id), (prev: DailyLogEntry[] | undefined) => {
          const withoutToday = (prev ?? []).filter((l) => l.date !== saved.date);
          return [...withoutToday, saved].sort((a, b) => a.date.localeCompare(b.date));
        });
      }

      const result = await applyDailyLog(today);
      if (user) {
        queryClient.setQueryData(queryKeys.progress.detail(user.id), result.progress);
        // applyDailyLog also recomputes progress on any active challenges
        // (server/src/services/challengeService.ts's updateChallengeProgress,
        // called from inside progressService.applyDailyLog's transaction) —
        // without this, the Challenges page shows stale progress until
        // something else happens to invalidate this same query key.
        queryClient.invalidateQueries({ queryKey: queryKeys.challenges.mine(user.id) });
      }

      setLastResult({ xpGained: result.xpGained, newAchievementTitles: result.newAchievementTitles });
      setForm(INITIAL_STATE);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, error, lastResult, isSubmitting, updateField, toggleHabit, handleSubmit };
}
