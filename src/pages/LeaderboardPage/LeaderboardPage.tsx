import { motion } from 'framer-motion';
import { useLeaderboard } from '../../features/leaderboard/hooks/useLeaderboard';
import LeaderboardTable from '../../features/leaderboard/components/LeaderboardTable';

export default function LeaderboardPage() {
  const rows = useLeaderboard();

  return (
    <section className="relative mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="orb w-96 h-64 bg-amber-500/8 -top-10 right-0" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 mb-3">
          🏆 Live Rankings
        </span>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Consistency Leaderboard
        </h1>
        <p className="mt-2 text-gray-400">
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
