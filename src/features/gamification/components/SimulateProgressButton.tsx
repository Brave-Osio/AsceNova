import { motion } from 'framer-motion';
import { Calendar, Trophy, Zap } from 'lucide-react';
import { useSimulateProgress } from '../hooks/useSimulateProgress';

export default function SimulateProgressButton() {
  const { simulate, isSimulating, lastResult } = useSimulateProgress();

  return (
    <div className="card h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
        Demo Tools
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <button
          type="button"
          onClick={() => simulate(45)}
          disabled={isSimulating}
          className="mt-3 w-full rounded-full bg-brand-primary py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-light disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {isSimulating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Simulating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={16} />
              Simulate 45 Days Progress
            </span>
          )}
        </button>

        {lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2 text-xs"
          >
            <div className="flex items-center gap-2 rounded-lg bg-brand-card-alt px-3 py-2 text-brand-primary-light">
              <Calendar size={14} />
              Simulated {lastResult.daysSimulated} days
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-brand-card-alt px-3 py-2 text-green-400">
              <Zap size={14} />
              +{lastResult.xpGained} XP earned
            </div>

            {lastResult.newAchievementTitles.length > 0 && (
              <div className="rounded-lg bg-brand-card-alt px-3 py-2 text-brand-accent">
                <div className="flex items-center gap-2">
                  <Trophy size={14} />
                  <span>Achievements Unlocked</span>
                </div>

                <ul className="mt-2 ml-6 list-disc">
                  {lastResult.newAchievementTitles.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        <p className="mt-3 text-center text-xs text-brand-text-muted">
          Instantly simulates 45 days of fitness activity for demonstration
          purposes.
        </p>
      </div>
    </div>
  );
}
