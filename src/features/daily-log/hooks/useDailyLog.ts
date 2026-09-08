import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { upsertLog } from '../../../services/logService';
import { applyDailyLog } from '../../../services/progressService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast } from '../../../lib/toast';
import { getTodayDateString } from '../../../utils/dateUtils';
import { validateNumberInRange } from '../../../utils/validation';
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

const INITIAL_STATE: DailyLogFormState = {
  weightKg: '',
  habits: DEFAULT_HABITS,
  notes: '',
};

/**
 * Orchestrates the daily-log write path, now fully backend-driven:
 * upsertLog (DailyProgress) -> applyDailyLog (streak/XP/achievements).
 * Gamification is fully cut over as of this domain — unlike the interim
 * dual-write period, a backend failure here means the submission's
 * gamification effects genuinely don't happen, surfaced via the error
 * toast, rather than silently falling back to a local computation.
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const weightError = validateNumberInRange(Number(form.weightKg), 30, 300, 'Weight (kg)');
    if (weightError) {
      setError(weightError);
      return;
    }
    setError(null);

    const today = getTodayDateString();
    const input = {
      date: today,
      weightKg: Number(form.weightKg),
      habits: form.habits,
      notes: form.notes.trim(),
    };

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
      }

      setLastResult({ xpGained: result.xpGained, newAchievementTitles: result.newAchievementTitles });
      setForm(INITIAL_STATE);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, error, lastResult, isSubmitting, updateField, toggleHabit, handleSubmit };
}
