import { motion } from 'framer-motion';
import { useSimulateProgress } from '../hooks/useSimulateProgress';

export default function SimulateProgressButton() {
  const { simulate, isSimulating, lastResult } = useSimulateProgress();

  return (
    <div className="glass h-full rounded-2xl p-5 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
        Demo Tools
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <button
          type="button"
          onClick={() => simulate(45)}
          disabled={isSimulating}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-bold text-white transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {isSimulating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Simulating...
            </span>
          ) : (
            '⚡ Simulate 45 Days Progress'
          )}
        </button>

        {lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2 text-xs"
          >
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-violet-300">
              <span>📅</span>
              Simulated {lastResult.daysSimulated} days
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-green-300">
              <span>⚡</span>
              +{lastResult.xpGained} XP earned
            </div>

            {lastResult.newAchievementTitles.length > 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-amber-300">
                <div className="flex items-center gap-2">
                  <span>🏆</span>
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

        <p className="mt-3 text-center text-xs text-gray-600">
          Instantly simulates 45 days of fitness activity for demonstration
          purposes.
        </p>
      </div>
    </div>
  );
}