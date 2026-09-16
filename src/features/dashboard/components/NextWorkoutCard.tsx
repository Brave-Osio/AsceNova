import { Link } from 'react-router-dom';
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
      <div className="glass h-full rounded-2xl p-5 flex flex-col">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Next Workout</div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500 text-center">Generate a plan to see your next workout.</p>
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
    <div className="glass h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Next Workout</div>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-bold text-violet-300">
          {isToday ? 'Today' : target.day}
        </span>
        {target.estimatedDurationMinutes && (
          <span className="text-xs text-gray-500">🕒 {target.estimatedDurationMinutes} min</span>
        )}
      </div>
      <div className="mt-2 text-lg font-extrabold text-white">{target.workoutName ?? target.focus}</div>
      {target.workoutName && <div className="text-xs text-gray-500">{target.focus}</div>}
      {exerciseCount > 0 && (
        <div className="mt-1.5 text-xs text-gray-500">{exerciseCount} exercises</div>
      )}
      <Link
        to={ROUTES.plan}
        className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-300 hover:text-violet-200"
      >
        View full plan →
      </Link>
    </div>
  );
}
