import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useLeaderboard } from '../../features/leaderboard/hooks/useLeaderboard';
import LeaderboardTable from '../../features/leaderboard/components/LeaderboardTable';

export default function LeaderboardPage() {
  const { rows, isLoading } = useLeaderboard();

  if (isLoading) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="chip chip-accent px-3 py-1 text-xs mb-3">
          <Trophy size={12} /> Live Rankings
        </span>
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
          Consistency Leaderboard
        </h1>
        <p className="mt-2 text-brand-text-secondary">
          Ranked by XP, streaks, and achievements — not weight lost.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-8"
      >
        <LeaderboardTable rows={rows} />
      </motion.div>
    </section>
  );
}
