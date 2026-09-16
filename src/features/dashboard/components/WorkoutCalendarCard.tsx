import { useLogs } from '../../daily-log/hooks/useLogs';
import { toDateString } from '../../../utils/dateUtils';

const DAYS_TO_SHOW = 28;

export default function WorkoutCalendarCard() {
  const { data: logs = [], isLoading } = useLogs();

  if (isLoading) return null;

  const logsByDate = new Map(logs.map((l) => [l.date, l]));
  const today = new Date();
  const todayStr = toDateString(today);

  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS_TO_SHOW - 1 - i));
    const dateStr = toDateString(d);
    return { dateStr, log: logsByDate.get(dateStr) };
  });

  return (
    <div className="glass h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Workout Calendar</div>
      <p className="mt-1 text-[10px] text-gray-600">Last {DAYS_TO_SHOW} days</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map(({ dateStr, log }) => {
          const isToday = dateStr === todayStr;
          const color = log?.habits.workoutCompleted ? 'bg-violet-500' : log ? 'bg-white/15' : 'bg-white/5';
          return (
            <div
              key={dateStr}
              title={dateStr}
              className={`aspect-square rounded-md ${color} ${isToday ? 'ring-1 ring-violet-300' : ''}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-violet-500" />
          Workout
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-white/15" />
          Logged
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-white/5" />
          No entry
        </span>
      </div>
    </div>
  );
}
