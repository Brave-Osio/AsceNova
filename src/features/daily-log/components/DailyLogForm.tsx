import { Dumbbell, Droplet, Beef, Moon, Footprints } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import TextField from '../../../components/ui/TextField';
import TextArea from '../../../components/ui/TextArea';
import Button from '../../../components/ui/Button';
import { useDailyLog } from '../hooks/useDailyLog';
import type { DailyHabits } from '../../../types/log.types';

const HABIT_ITEMS: { key: keyof DailyHabits; label: string; icon: LucideIcon }[] = [
  { key: 'workoutCompleted', label: 'Workout Completed', icon: Dumbbell },
  { key: 'hitWaterGoal', label: 'Hit Water Goal (3L)', icon: Droplet },
  { key: 'hitProteinGoal', label: 'Hit Protein Goal', icon: Beef },
  { key: 'slept7PlusHours', label: 'Slept 7+ Hours', icon: Moon },
  { key: 'reachedStepGoal', label: 'Reached Step Goal (8,000+)', icon: Footprints },
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
            <span className="text-sm font-medium text-brand-text-secondary">Today's Checklist</span>
            <span className="text-xs text-brand-text-muted">{checkedCount} / {HABIT_ITEMS.length} done</span>
          </div>

          <div className="flex flex-col gap-2">
            {HABIT_ITEMS.map((item) => {
              const isChecked = form.habits[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    isChecked
                      ? 'border-brand-primary/50 bg-brand-primary/10'
                      : 'border-brand-border bg-brand-card hover:border-white/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleHabit(item.key, e.target.checked)}
                    className="h-5 w-5 rounded border-brand-border bg-brand-card text-brand-primary focus:ring-brand-primary/60"
                  />
                  <item.icon size={16} className="text-brand-text-secondary" />
                  <span className={`text-sm font-medium ${isChecked ? 'text-brand-text' : 'text-brand-text-secondary'}`}>
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
        <div className="card rounded-xl p-4">
          <p className="text-sm font-medium text-brand-text">
            +{lastResult.xpGained} XP gained
          </p>
          {lastResult.newAchievementTitles.length > 0 && (
            <p className="mt-1 text-sm text-brand-primary-light">
              New achievement{lastResult.newAchievementTitles.length > 1 ? 's' : ''} unlocked:{' '}
              {lastResult.newAchievementTitles.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
