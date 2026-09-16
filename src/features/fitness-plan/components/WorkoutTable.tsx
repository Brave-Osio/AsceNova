import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkoutDay, WorkoutExercise } from '../../../types/plan.types';

interface WorkoutTableProps {
  workoutDays: WorkoutDay[];
}

const FOCUS_COLORS: Record<string, { dot: string; bg: string }> = {
  'Rest':                     { dot: 'bg-gray-500',    bg: 'bg-gray-500/10' },
  'Cardio':                   { dot: 'bg-cyan-500',     bg: 'bg-cyan-500/10' },
  'Cardio + Core':            { dot: 'bg-cyan-500',     bg: 'bg-cyan-500/10' },
  'Cardio Intervals':         { dot: 'bg-cyan-400',     bg: 'bg-cyan-400/10' },
  'Push Day':                 { dot: 'bg-violet-500',   bg: 'bg-violet-500/10' },
  'Pull Day':                 { dot: 'bg-indigo-500',   bg: 'bg-indigo-500/10' },
  'Leg Day':                  { dot: 'bg-rose-500',     bg: 'bg-rose-500/10' },
  'Full Body Strength':       { dot: 'bg-amber-500',    bg: 'bg-amber-500/10' },
  'Upper Body Accessory':     { dot: 'bg-purple-500',   bg: 'bg-purple-500/10' },
  'Mobility + Core':          { dot: 'bg-teal-500',     bg: 'bg-teal-500/10' },
  'Light Cardio':             { dot: 'bg-sky-400',      bg: 'bg-sky-400/10' },
  'Active Recovery (Walk)':   { dot: 'bg-green-500',    bg: 'bg-green-500/10' },
};

function getFocusStyle(focus: string) {
  return FOCUS_COLORS[focus] ?? { dot: 'bg-violet-500', bg: 'bg-violet-500/10' };
}

function ExerciseRow({ exercise }: { exercise: WorkoutExercise }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-100">{exercise.name}</span>
        <span className="whitespace-nowrap text-xs font-bold text-violet-300">
          {exercise.sets} × {exercise.reps}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span>⏱ {exercise.restSeconds}s rest</span>
        {exercise.tempo && <span>Tempo {exercise.tempo}</span>}
        {exercise.difficulty && <span className="capitalize">{exercise.difficulty.toLowerCase()}</span>}
        {exercise.equipment && <span>{exercise.equipment}</span>}
      </div>
      {exercise.targetMuscles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {exercise.targetMuscles.map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300"
            >
              {muscle}
            </span>
          ))}
        </div>
      )}
      {exercise.notes && <p className="mt-1.5 text-xs text-gray-500">{exercise.notes}</p>}
    </div>
  );
}

function DayDetail({ day }: { day: WorkoutDay }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="space-y-3 border-t border-white/5 bg-white/2 px-5 py-4">
        {day.estimatedDurationMinutes && (
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span>🕒 {day.estimatedDurationMinutes} min</span>
            {day.estimatedCaloriesBurned && <span>🔥 ~{day.estimatedCaloriesBurned} kcal</span>}
          </div>
        )}
        {day.warmUp && (
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Warm-up: </span>
            {day.warmUp}
          </p>
        )}

        {(day.exercises?.length ?? 0) > 0 && (
          <div className="space-y-2">
            {day.exercises!.map((exercise) => (
              <ExerciseRow key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}

        {day.coolDown && (
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Cooldown: </span>
            {day.coolDown}
          </p>
        )}
        {day.coachingTips && day.coachingTips.length > 0 && (
          <ul className="space-y-1 text-xs text-gray-400">
            {day.coachingTips.map((tip) => (
              <li key={tip} className="flex gap-1.5">
                <span className="text-violet-400">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        )}
        {day.progressionAdvice && (
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Progression: </span>
            {day.progressionAdvice}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function WorkoutTable({ workoutDays }: WorkoutTableProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8">
      {workoutDays.map((day, i) => {
        const style = getFocusStyle(day.focus);
        const isRest = day.focus.toLowerCase().includes('rest');
        const hasDetail = (day.exercises?.length ?? 0) > 0;
        const isExpanded = expandedDay === day.day;

        return (
          <div key={day.day} className="border-b border-white/5 last:border-0">
            <motion.button
              type="button"
              onClick={() => hasDetail && setExpandedDay(isExpanded ? null : day.day)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`
                workout-row flex w-full items-center justify-between px-5 py-3.5 text-left
                ${isRest ? 'opacity-50' : ''}
                ${hasDetail ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
                <span className="text-sm font-semibold text-gray-200 w-28">{day.day}</span>
                {day.workoutName && (
                  <span className="hidden text-xs text-gray-500 sm:inline">{day.workoutName}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`
                  rounded-full px-3 py-1 text-xs font-semibold
                  ${style.bg} text-gray-200
                `}>
                  {day.focus}
                </span>
                {hasDetail && (
                  <span className="text-xs text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                )}
              </div>
            </motion.button>
            <AnimatePresence initial={false}>
              {isExpanded && hasDetail && <DayDetail day={day} />}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
