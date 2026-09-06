import { motion } from 'framer-motion';
import { useUserProgress } from '../../../context/UserProgressContext';
import { ACHIEVEMENTS } from '../../../constants/achievements';

export default function AchievementCard() {
  const { unlockedAchievementIds } = useUserProgress();

  const earned = ACHIEVEMENTS.filter((a) =>
    unlockedAchievementIds.includes(a.id),
  );

  const unearned = ACHIEVEMENTS.filter(
    (a) => !unlockedAchievementIds.includes(a.id),
  ).slice(0, 3);

  return (
    <div className="glass h-full rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Achievements
        </div>

        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-bold text-violet-300">
          {earned.length}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {earned.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {earned.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                title={`${a.title}: ${a.description}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-xl"
              >
                {a.icon}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-gray-500">
            Log your first habit to unlock achievements.
          </p>
        )}

        {unearned.length > 0 && (
          <div className="mt-4 border-t border-white/5 pt-3">
            <p className="mb-2 text-center text-xs text-gray-600">
              Up next:
            </p>

            <div className="flex justify-center gap-2">
              {unearned.map((a) => (
                <div
                  key={a.id}
                  title={`${a.title}: ${a.description}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-xl grayscale opacity-40"
                >
                  {a.icon}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}