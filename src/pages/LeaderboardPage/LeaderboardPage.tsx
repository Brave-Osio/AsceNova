import { motion } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader';
import { useLeaderboard } from '../../features/leaderboard/hooks/useLeaderboard';
import LeaderboardTable from '../../features/leaderboard/components/LeaderboardTable';
import { pageEnter } from '../../lib/motion';
import PageContainer from '../../components/layout/PageContainer';

export default function LeaderboardPage() {
  const { rows, isLoading } = useLeaderboard();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Live Rankings"
        title="Consistency Leaderboard"
        description="Ranked by XP, streaks, and achievements, not weight lost."
      />

      <motion.div initial="hidden" animate="visible" variants={pageEnter} className="mt-8 max-w-4xl">
        <LeaderboardTable rows={rows} isLoading={isLoading} />
      </motion.div>
    </PageContainer>
  );
}
