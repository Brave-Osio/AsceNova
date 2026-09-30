import { Link } from 'react-router-dom';
import { Check, Circle, Droplet, Dumbbell, Footprints, Beef, Moon, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePlanGenerator } from '../../fitness-plan/hooks/usePlanGenerator';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { useProfile } from '../../profile/hooks/useProfile';
import { getTodayDateString } from '../../../utils/dateUtils';
import { ROUTES } from '../../../constants/routes';
import type { DailyHabits } from '../../../types/log.types';

interface TargetItem {
  key: keyof DailyHabits;
  label: string;
  target: string;
  icon: LucideIcon;
}

/**
 * The daily log stores habit checkboxes (not consumed amounts), so "progress
 * toward today's target" is the number of today's targets hit — each row shows
 * the concrete goal it stands for (water/protein come from the active plan).
 */
function buildItems(waterLiters: number | undefined, proteinGrams: number | undefined, sleepHours: number | null | undefined): TargetItem[] {
  return [
    { key: 'workoutCompleted', label: 'Workout', target: 'Complete today’s session', icon: Dumbbell },
    { key: 'hitWaterGoal', label: 'Water', target: waterLiters ? `${waterLiters} L` : 'Hit your water goal', icon: Droplet },
    { key: 'hitProteinGoal', label: 'Protein', target: proteinGrams ? `${proteinGrams} g` : 'Hit your protein goal', icon: Beef },
    { key: 'slept7PlusHours', label: 'Sleep', target: `${sleepHours ?? 7}+ hours`, icon: Moon },
    { key: 'reachedStepGoal', label: 'Steps', target: '8,000+ steps', icon: Footprints },
  ];
}

export default function TodayTargetsCard() {
  const { plan, isLoading: isPlanLoading } = usePlanGenerator();
  const { data: logs, isLoading: isLogsLoading } = useLogs();
  const { data: profile } = useProfile();

  if (isPlanLoading || isLogsLoading) {
    return <div className="card h-56 animate-pulse rounded-3xl" aria-busy="true" aria-label="Loading today's target" />;
  }

  const todayLog = logs?.find((l) => l.date === getTodayDateString());
  const items = buildItems(plan?.nutrition.waterLiters, plan?.nutrition.proteinGrams, profile?.sleepHoursTarget);
  const done = todayLog ? items.filter((item) => todayLog.habits[item.key]).length : 0;
  const total = items.length;
  const percent = Math.round((done / total) * 100);
  const remaining = total - done;
  const isComplete = done === total;

  return (
    <div className="card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Today's Target</div>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-black leading-none text-brand-text sm:text-6xl">{percent}%</span>
            <span className="mb-1 text-sm font-semibold text-brand-text-secondary">complete</span>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-bold text-brand-text">
            {done} <span className="font-medium text-brand-text-secondary">of {total} targets hit</span>
          </div>
          <div className={`mt-0.5 text-xs font-semibold ${isComplete ? 'text-emerald-400 light:text-emerald-700' : 'text-brand-text-muted'}`}>
            {isComplete ? 'All targets hit — great day!' : `${remaining} remaining`}
          </div>
        </div>
      </div>

      <div
        className="mt-5 h-4 w-full overflow-hidden rounded-full bg-brand-card-alt"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Today's target progress"
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-emerald-500' : 'bg-brand-primary'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const hit = !!todayLog?.habits[item.key];
          return (
            <li
              key={item.key}
              className={`rounded-2xl border p-3 transition-colors ${
                hit ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-brand-border bg-brand-card-alt'
              }`}
            >
              <div className="flex items-center justify-between">
                <item.icon size={16} className={hit ? 'text-emerald-400 light:text-emerald-700' : 'text-brand-text-muted'} />
                {hit ? (
                  <Check size={14} strokeWidth={3} className="text-emerald-400 light:text-emerald-700" aria-label="Done" />
                ) : (
                  <Circle size={14} className="text-brand-text-muted" aria-label="Not done" />
                )}
              </div>
              <div className="mt-2 text-sm font-bold text-brand-text">{item.label}</div>
              <div className="text-xs text-brand-text-secondary">{item.target}</div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4 text-xs">
        {plan ? (
          <span className="text-brand-text-secondary">
            Daily nutrition:{' '}
            <span className="font-semibold text-brand-text">{plan.nutrition.calories} kcal</span> · P{' '}
            {plan.nutrition.proteinGrams}g · C {plan.nutrition.carbsGrams}g · F {plan.nutrition.fatGrams}g
          </span>
        ) : (
          <Link to={ROUTES.plan} className="font-medium text-brand-primary-light hover:text-brand-text hover:underline">
            Generate a plan to see calorie & macro targets →
          </Link>
        )}
        {!todayLog && (
          <Link
            to={ROUTES.log}
            className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-4 py-2 font-bold text-white transition-colors hover:bg-brand-primary-light"
          >
            Log today's progress <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </div>
  );
}
