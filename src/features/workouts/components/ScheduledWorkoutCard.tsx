import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Dumbbell, Flame, Moon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { ROUTES } from '../../../constants/routes';
import { getErrorMessage } from '../../../lib/errors';
import { useCompleteWorkout, useWorkoutForDate } from '../hooks/useScheduledWorkout';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function EmptyState({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="text-brand-text-muted">{icon}</span>
      <h3 className="mt-3 text-base font-bold text-brand-text">{title}</h3>
      {children && <div className="mt-1 max-w-sm text-sm text-brand-text-secondary">{children}</div>}
    </div>
  );
}

/**
 * The workout scheduled for one date, taken from the user's existing active plan (never generated here),
 * with a "Mark as Done" action. `date` is the user's local calendar day, YYYY-MM-DD.
 */
export default function ScheduledWorkoutCard({ date }: { date: string }) {
  const { data, isLoading, isError, refetch } = useWorkoutForDate(date);
  const complete = useCompleteWorkout(date);
  const heading = DATE_FORMAT.format(new Date(`${date}T00:00:00`));

  return (
    <section className="card rounded-2xl p-5 sm:p-6" aria-labelledby="scheduled-workout-heading" aria-busy={isLoading}>
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Scheduled workout</div>
      <h2 id="scheduled-workout-heading" className="mt-1 text-lg font-bold text-brand-text">
        {heading}
      </h2>

      {isLoading ? (
        <div className="mt-4 space-y-3" role="status" aria-label="Loading scheduled workout">
          <div className="h-5 w-1/2 animate-pulse rounded bg-brand-card-alt" />
          <div className="h-16 animate-pulse rounded-xl bg-brand-card-alt" />
        </div>
      ) : isError || !data ? (
        <div className="mt-4">
          <p className="text-sm text-red-400 light:text-red-700" role="alert">
            Couldn't load the workout for this day.
          </p>
          <div className="mt-3">
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : !data.hasPlan ? (
        <EmptyState icon={<Dumbbell size={32} />} title="No workout plan yet">
          Generate your plan to see what's scheduled each day.
          <div className="mt-4">
            <Link
              to={ROUTES.plan}
              className="inline-block rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light"
            >
              Go to my plan
            </Link>
          </div>
        </EmptyState>
      ) : data.isRestDay || !data.workout ? (
        <EmptyState icon={<Moon size={32} />} title="Rest day">
          No workout is scheduled for this day. Recovery is part of the plan.
        </EmptyState>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-text-secondary">
            <span className="font-semibold text-brand-text">{data.workout.name ?? data.workout.focus}</span>
            <span>{data.workout.dayLabel}</span>
            {data.workout.estimatedDurationMinutes != null && (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} /> {data.workout.estimatedDurationMinutes} min
              </span>
            )}
            {data.workout.estimatedCaloriesBurned != null && (
              <span className="inline-flex items-center gap-1">
                <Flame size={14} /> ~{data.workout.estimatedCaloriesBurned} kcal
              </span>
            )}
          </div>

          {data.workout.warmUp && (
            <p className="mt-3 text-sm text-brand-text-secondary">
              <span className="font-semibold text-brand-text">Warm-up: </span>
              {data.workout.warmUp}
            </p>
          )}

          <ol className="mt-4 divide-y divide-brand-border rounded-xl border border-brand-border">
            {data.workout.exercises.map((exercise, i) => (
              <li key={exercise.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-brand-text">
                    {i + 1}. {exercise.name}
                  </div>
                  {(exercise.notes || exercise.equipment) && (
                    <div className="mt-0.5 text-xs text-brand-text-muted">
                      {[exercise.equipment, exercise.notes].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-brand-text-secondary">
                  <span className="font-semibold text-brand-text">
                    {exercise.sets} × {exercise.reps}
                  </span>
                  <span className="ml-2 text-xs text-brand-text-muted">rest {exercise.restSeconds}s</span>
                </div>
              </li>
            ))}
          </ol>

          {data.workout.coolDown && (
            <p className="mt-3 text-sm text-brand-text-secondary">
              <span className="font-semibold text-brand-text">Cool-down: </span>
              {data.workout.coolDown}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {data.completed ? (
              <div
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 light:text-emerald-700"
                role="status"
              >
                <CheckCircle2 size={16} /> Completed
              </div>
            ) : (
              <Button loading={complete.isPending} onClick={() => complete.mutate(data.workout!.id)}>
                Mark as Done
              </Button>
            )}
            {complete.isError && !data.completed && (
              <span className="text-sm text-red-400 light:text-red-700" role="alert">
                {getErrorMessage(complete.error)}
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
