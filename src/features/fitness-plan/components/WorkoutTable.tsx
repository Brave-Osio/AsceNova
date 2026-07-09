import { motion } from 'framer-motion';
import type { WorkoutDay } from '../../../types/plan.types';

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

export default function WorkoutTable({ workoutDays }: WorkoutTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8">
      {workoutDays.map((day, i) => {
        const style = getFocusStyle(day.focus);
        const isRest = day.focus.toLowerCase().includes('rest');
        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`
              workout-row flex items-center justify-between px-5 py-3.5
              border-b border-white/5 last:border-0
              ${isRest ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
              <span className="text-sm font-semibold text-gray-200 w-28">{day.day}</span>
            </div>
            <span className={`
              rounded-full px-3 py-1 text-xs font-semibold
              ${style.bg} text-gray-200
            `}>
              {day.focus}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
