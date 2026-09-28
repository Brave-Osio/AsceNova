import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useUserProgress } from '../hooks/useUserProgress';
import { ACHIEVEMENTS } from '../../../constants/achievements';

export default function AchievementCard() {
  const { unlockedAchievementIds, isLoading } = useUserProgress();

  if (isLoading) return null;

  const earned = ACHIEVEMENTS.filter((a) =>
    unlockedAchievementIds.includes(a.id),
  );

  const unearned = ACHIEVEMENTS.filter(
    (a) => !unlockedAchievementIds.includes(a.id),
  ).slice(0, 3);

  return (
    <div className="card h-full rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
          Achievements
        </div>

        <span className="chip chip-primary px-2 py-0.5 text-xs">
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/15 text-brand-accent-ink"
              >
                <Award size={18} strokeWidth={2} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-brand-text-muted">
            Log your first habit to unlock achievements.
          </p>
        )}

        {unearned.length > 0 && (
          <div className="mt-4 border-t border-brand-border pt-3">
            <p className="mb-2 text-center text-xs text-brand-text-muted">
              Up next:
            </p>

            <div className="flex justify-center gap-2">
              {unearned.map((a) => (
                <div
                  key={a.id}
                  title={`${a.title}: ${a.description}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-card-alt text-brand-text-muted"
                >
                  <Award size={18} strokeWidth={2} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
