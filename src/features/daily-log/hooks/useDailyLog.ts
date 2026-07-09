import { useState } from 'react';
import { saveLog } from '../../../storage/logStorage';
import { useUserProgress } from '../../../context/UserProgressContext';
import { XP_EVENTS } from '../../../engines/xpEngine';
import { getTodayDateString } from '../../../utils/dateUtils';
import { ACHIEVEMENTS } from '../../../constants/achievements';
import { validateNumberInRange } from '../../../utils/validation';
import { DEFAULT_HABITS, type DailyHabits } from '../../../types/log.types';

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

/** Maps each habit key to its corresponding XP_EVENTS constructor, so the submit handler can loop instead of hand-writing five if-blocks. */
const HABIT_XP_EVENTS: Record<keyof DailyHabits, () => { amount: number; reason: string }> = {
  workoutCompleted: XP_EVENTS.workoutCompleted,
  hitWaterGoal: XP_EVENTS.hitWaterGoal,
  hitProteinGoal: XP_EVENTS.hitProteinGoal,
  slept7PlusHours: XP_EVENTS.slept7PlusHours,
  reachedStepGoal: XP_EVENTS.reachedStepGoal,
};

/**
 * Orchestrates the full daily-log write path:
 * saveLog -> recordLogDate (streak) -> gainXp (check-in + each checked habit) -> checkAchievements.
 *
 * The ORDER is significant: streak and XP must update before achievements
 * are evaluated, since several achievement rules (seven_day_streak,
 * bronze_promotion) read the just-updated progress values.
 */
export function useDailyLog() {
  const { recordLogDate, gainXp, checkAchievements } = useUserProgress();
  const [form, setForm] = useState<DailyLogFormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null);

  function updateField<K extends keyof DailyLogFormState>(field: K, value: DailyLogFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleHabit(habit: keyof DailyHabits, checked: boolean) {
    setForm((prev) => ({ ...prev, habits: { ...prev.habits, [habit]: checked } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const weightError = validateNumberInRange(Number(form.weightKg), 30, 300, 'Weight (kg)');
    if (weightError) {
      setError(weightError);
      return;
    }
    setError(null);

    const today = getTodayDateString();

    saveLog({
      date: today,
      weightKg: Number(form.weightKg),
      habits: form.habits,
      notes: form.notes.trim(),
    });

    recordLogDate(today);

    let xpGained = XP_EVENTS.dailyCheckIn().amount;
    gainXp(XP_EVENTS.dailyCheckIn());

    for (const habitKey of Object.keys(form.habits) as (keyof DailyHabits)[]) {
      if (form.habits[habitKey]) {
        const event = HABIT_XP_EVENTS[habitKey]();
        gainXp(event);
        xpGained += event.amount;
      }
    }

    const newlyUnlockedIds = checkAchievements();
    const newAchievementTitles = newlyUnlockedIds.map(
      (id) => ACHIEVEMENTS.find((a) => a.id === id)?.title ?? id,
    );
    if (newlyUnlockedIds.length > 0) {
      xpGained += newlyUnlockedIds.length * 100; // matches XP_REWARDS.achievementUnlock
    }

    setLastResult({ xpGained, newAchievementTitles });
    setForm(INITIAL_STATE);
  }

  return { form, error, lastResult, updateField, toggleHabit, handleSubmit };
}
