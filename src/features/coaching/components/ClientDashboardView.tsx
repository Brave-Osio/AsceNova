import { Flame, Dumbbell, Droplets, Beef, Moon, Footprints, Trophy } from 'lucide-react';
import type { ClientActivityDay, ClientDashboard } from '../../../types/coaching.types';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 light:text-emerald-700',
  COMPLETED: 'bg-brand-primary/15 text-brand-primary-light',
  ABANDONED: 'bg-amber-500/15 text-amber-300 light:text-amber-700',
};

const HABITS: { key: keyof Omit<ClientActivityDay, 'date'>; label: string; icon: typeof Flame }[] = [
  { key: 'workoutCompleted', label: 'Workout', icon: Dumbbell },
  { key: 'hitWaterGoal', label: 'Water goal', icon: Droplets },
  { key: 'hitProteinGoal', label: 'Protein goal', icon: Beef },
  { key: 'slept7PlusHours', label: 'Slept 7+ hours', icon: Moon },
  { key: 'reachedStepGoal', label: 'Step goal', icon: Footprints },
];

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{label}</div>
      <div className="mt-2 text-3xl font-black text-brand-text">{value}</div>
      {hint && <div className="mt-1 text-xs text-brand-text-muted">{hint}</div>}
    </div>
  );
}

function titleCase(value: string): string {
  return GOAL_LABEL[value] ?? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}

/** Last-30-days habit grid: one row per habit, one cell per logged day. Days without a log are simply absent. */
function ActivityGrid({ activity }: { activity: ClientActivityDay[] }) {
  if (activity.length === 0) {
    return <p className="text-sm text-brand-text-muted">No check-ins in the last 30 days.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="text-xs">
        <tbody>
          {HABITS.map(({ key, label, icon: Icon }) => (
            <tr key={key}>
              <th scope="row" className="whitespace-nowrap py-1 pr-4 text-left font-medium text-brand-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Icon size={13} aria-hidden="true" /> {label}
                </span>
              </th>
              {activity.map((day) => (
                <td key={day.date} className="px-0.5 py-1">
                  <span
                    title={`${day.date}: ${day[key] ? 'done' : 'not done'}`}
                    aria-label={`${label} on ${day.date}: ${day[key] ? 'done' : 'not done'}`}
                    className={`block h-4 w-4 rounded ${day[key] ? 'bg-emerald-500/80' : 'bg-brand-card-alt'}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-brand-text-muted">
        {activity[0].date} to {activity[activity.length - 1].date} · logged days only
      </p>
    </div>
  );
}

export default function ClientDashboardView({ dashboard }: { dashboard: ClientDashboard }) {
  const { progress, totals, focus, activity, goals } = dashboard;
  const last7 = activity.slice(-7);
  const workouts7d = last7.filter((d) => d.workoutCompleted).length;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Rank" value={titleCase(progress.rank)} hint={`${progress.totalXp} XP`} />
        <StatCard
          label="Streak"
          value={String(progress.currentStreak)}
          hint={`days · longest ${progress.longestStreak}${progress.lastLogDate ? ` · last log ${progress.lastLogDate}` : ''}`}
        />
        <StatCard label="Workouts" value={String(totals.workoutsCompleted)} hint={`${workouts7d} in the last 7 logged days`} />
        <StatCard label="Check-ins" value={String(totals.checkIns)} hint={`${totals.achievementsUnlocked} achievements`} />
      </div>

      {focus && (
        <div className="card flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl p-5 text-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Focus</span>
          <span className="font-semibold text-brand-text">{titleCase(focus.fitnessGoal)}</span>
          <span className="text-brand-text-secondary">{LEVEL_LABEL[focus.fitnessLevel] ?? focus.fitnessLevel}</span>
        </div>
      )}

      <div className="card rounded-2xl p-5">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Habits · last 30 days</div>
        <ActivityGrid activity={activity} />
      </div>

      <div className="card rounded-2xl p-5">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-text-muted">Goals</div>
        {goals.length === 0 ? (
          <p className="text-sm text-brand-text-muted">No goals set.</p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {goals.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-brand-text">
                  <Trophy size={14} aria-hidden="true" /> {titleCase(g.goalType)}
                </span>
                <span className="flex items-center gap-3 text-xs text-brand-text-muted">
                  {g.targetDate && <span>Target {g.targetDate}</span>}
                  <span className={`chip px-2 py-0.5 ${STATUS_BADGE[g.status] ?? ''}`}>{g.status}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
