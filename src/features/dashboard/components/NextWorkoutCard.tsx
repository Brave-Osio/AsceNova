import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { usePlanGenerator } from '../../fitness-plan/hooks/usePlanGenerator';
import { ROUTES } from '../../../constants/routes';
import type { WorkoutDay } from '../../../types/plan.types';

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isRestDay(day: WorkoutDay): boolean {
  return day.focus.toLowerCase().includes('rest');
}

export default function NextWorkoutCard() {
  const { plan, isLoading } = usePlanGenerator();

  if (isLoading) return null;

  if (!plan || plan.workoutDays.length === 0) {
    return (
      <div className="card h-full rounded-2xl p-5 flex flex-col">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Next Workout</div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-brand-text-muted text-center">Generate a plan to see your next workout.</p>
        </div>
      </div>
    );
  }

  const todayLabel = WEEKDAY_LABELS[new Date().getDay()];
  const todayIndex = plan.workoutDays.findIndex((d) => d.day === todayLabel);
  const anchorIndex = todayIndex === -1 ? 0 : todayIndex;

  let target = plan.workoutDays[anchorIndex];
  let isToday = true;
  if (isRestDay(target)) {
    for (let offset = 1; offset <= plan.workoutDays.length; offset++) {
      const candidate = plan.workoutDays[(anchorIndex + offset) % plan.workoutDays.length];
      if (!isRestDay(candidate)) {
        target = candidate;
        isToday = false;
        break;
      }
    }
  }

  const exerciseCount = target.exercises?.length ?? 0;

  return (
    <div className="card h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Next Workout</div>
      <div className="mt-3 flex items-center gap-2">
        <span className="chip chip-primary px-2.5 py-0.5 text-xs">
          {isToday ? 'Today' : target.day}
        </span>
        {target.estimatedDurationMinutes && (
          <span className="flex items-center gap-1 text-xs text-brand-text-muted">
            <Clock size={12} /> {target.estimatedDurationMinutes} min
          </span>
        )}
      </div>
      <div className="mt-2 text-lg font-extrabold text-brand-text">{target.workoutName ?? target.focus}</div>
      {target.workoutName && <div className="text-xs text-brand-text-muted">{target.focus}</div>}
      {exerciseCount > 0 && (
        <div className="mt-1.5 text-xs text-brand-text-muted">{exerciseCount} exercises</div>
      )}
      <Link
        to={ROUTES.plan}
        className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-primary-light hover:text-white"
      >
        View full plan <ArrowRight size={12} />
      </Link>
    </div>
  );
}
