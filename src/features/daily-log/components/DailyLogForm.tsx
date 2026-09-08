import TextField from '../../../components/ui/TextField';
import TextArea from '../../../components/ui/TextArea';
import Button from '../../../components/ui/Button';
import { useDailyLog } from '../hooks/useDailyLog';
import type { DailyHabits } from '../../../types/log.types';

const HABIT_ITEMS: { key: keyof DailyHabits; label: string; icon: string }[] = [
  { key: 'workoutCompleted', label: 'Workout Completed', icon: '💪' },
  { key: 'hitWaterGoal', label: 'Hit Water Goal (3L)', icon: '💧' },
  { key: 'hitProteinGoal', label: 'Hit Protein Goal', icon: '🍗' },
  { key: 'slept7PlusHours', label: 'Slept 7+ Hours', icon: '😴' },
  { key: 'reachedStepGoal', label: 'Reached Step Goal (8,000+)', icon: '👟' },
];

export default function DailyLogForm() {
  const { form, error, lastResult, isSubmitting, updateField, toggleHabit, handleSubmit } = useDailyLog();
  const checkedCount = Object.values(form.habits).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <TextField
          label="Current Weight (kg)"
          type="number"
          value={form.weightKg}
          onChange={(v) => updateField('weightKg', v)}
          placeholder="70"
          error={error ?? undefined}
        />

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-gray-300">Today's Checklist</span>
            <span className="text-xs text-gray-500">{checkedCount} / {HABIT_ITEMS.length} done</span>
          </div>

          <div className="flex flex-col gap-2">
            {HABIT_ITEMS.map((item) => {
              const isChecked = form.habits[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    isChecked
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleHabit(item.key, e.target.checked)}
                    className="h-5 w-5 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-sm font-medium ${isChecked ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <TextArea
          label="Notes"
          value={form.notes}
          onChange={(v) => updateField('notes', v)}
          placeholder="How did today go?"
        />

        <div>
          <Button type="submit" loading={isSubmitting}>Save Log</Button>
        </div>
      </form>

      {lastResult && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
          <p className="text-sm font-medium text-white">
            +{lastResult.xpGained} XP gained
          </p>
          {lastResult.newAchievementTitles.length > 0 && (
            <p className="mt-1 text-sm text-violet-300">
              New achievement{lastResult.newAchievementTitles.length > 1 ? 's' : ''} unlocked:{' '}
              {lastResult.newAchievementTitles.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
