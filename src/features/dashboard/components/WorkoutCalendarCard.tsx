import { useState } from 'react';
import { useLogs } from '../../daily-log/hooks/useLogs';
import { toDateString } from '../../../utils/dateUtils';
import { useToday } from '../../../hooks/useToday';

const DAYS_TO_SHOW = 28;

const MONTH_SHORT = new Intl.DateTimeFormat('en-US', { month: 'short' });
const RANGE_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const FULL_FORMAT = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

type DayState = 'workout' | 'logged' | 'none';

const TILE_TONE: Record<DayState, string> = {
  workout: 'bg-brand-primary text-white',
  logged: 'bg-brand-primary/25 text-brand-text',
  none: 'bg-brand-text-muted/15 text-brand-text-muted',
};

const STATE_LABEL: Record<DayState, string> = {
  workout: 'Workout completed',
  logged: 'Logged, no workout',
  none: 'No entry',
};

export default function WorkoutCalendarCard() {
  const { data: logs = [], isLoading } = useLogs();
  const todayStr = useToday();
  // Set by hover, keyboard focus or tap, so the details never depend on hover alone.
  const [activeDate, setActiveDate] = useState<string | null>(null);

  if (isLoading) return <div className="card h-full min-h-48 animate-pulse rounded-2xl" aria-busy="true" />;

  const logsByDate = new Map(logs.map((l) => [l.date, l]));
  const today = new Date(`${todayStr}T00:00:00`);

  const days = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS_TO_SHOW - 1 - i));
    const dateStr = toDateString(d);
    const log = logsByDate.get(dateStr);
    const state: DayState = log?.habits.workoutCompleted ? 'workout' : log ? 'logged' : 'none';
    return { date: d, dateStr, log, state };
  });

  const completedCount = days.filter((d) => d.state === 'workout').length;
  const rangeLabel = `${RANGE_FORMAT.format(days[0].date)} to ${RANGE_FORMAT.format(days[days.length - 1].date)}`;
  const active = days.find((d) => d.dateStr === activeDate);
  const activeHabits = active?.log ? Object.values(active.log.habits).filter(Boolean).length : 0;
  const activeHabitTotal = active?.log ? Object.keys(active.log.habits).length : 0;

  return (
    <div className="card flex h-full flex-col rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Workout Calendar</div>
      <p className="mt-1 text-xs text-brand-text-muted">
        {rangeLabel}
        <span aria-hidden="true"> · </span>
        {completedCount} {completedCount === 1 ? 'workout' : 'workouts'} completed
      </p>

      <div
        className="mt-3 grid grid-cols-7 gap-1.5"
        onMouseLeave={() => setActiveDate(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setActiveDate(null);
        }}
      >
        {days.map(({ date, dateStr, state }) => {
          const isToday = dateStr === todayStr;
          const isActive = dateStr === activeDate;
          return (
            <button
              key={dateStr}
              type="button"
              aria-label={`${FULL_FORMAT.format(date)}: ${STATE_LABEL[state].toLowerCase()}`}
              aria-pressed={isActive}
              onMouseEnter={() => setActiveDate(dateStr)}
              onFocus={() => setActiveDate(dateStr)}
              onClick={() => setActiveDate(dateStr)}
              // Hover/focus only transform and recolor (no size or layout change), so the grid never shifts.
              className={`relative flex aspect-square flex-col items-center justify-center rounded-md leading-none transition-all duration-150 ease-out hover:z-10 hover:scale-110 hover:shadow-lg focus-visible:z-10 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-light motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100 ${TILE_TONE[state]} ${
                state === 'workout' ? 'hover:shadow-brand-primary/40' : 'hover:bg-brand-primary/40 hover:text-brand-text'
              } ${isToday ? 'ring-1 ring-brand-primary-light' : ''} ${isActive ? 'z-10 scale-110 shadow-lg ring-2 ring-brand-primary-light motion-reduce:scale-100' : ''}`}
            >
              <span className="text-[11px] font-bold">{date.getDate()}</span>
              <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-wide opacity-75">{MONTH_SHORT.format(date)}</span>
            </button>
          );
        })}
      </div>

      {/* Fixed-height details line: filled by hover, focus or tap, never shifts the layout. */}
      <p className="mt-3 min-h-9 text-[11px] leading-snug text-brand-text-secondary" aria-live="polite">
        {active ? (
          <>
            <span className="font-semibold text-brand-text">{FULL_FORMAT.format(active.date)}</span>
            {': '}
            {STATE_LABEL[active.state]}
            {active.log && (
              <>
                , {active.log.weightKg} kg, {activeHabits} of {activeHabitTotal} habits
              </>
            )}
          </>
        ) : (
          <span className="text-brand-text-muted">Hover, focus or tap a day for details.</span>
        )}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-brand-text-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-brand-primary" />
          Workout done
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-brand-primary/25" />
          Logged
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-brand-text-muted/20" />
          No entry
        </span>
      </div>
    </div>
  );
}
