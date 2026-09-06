import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { ROUTES } from '../../constants/routes';
import RankCard from '../../features/gamification/components/RankCard';
import XpCard from '../../features/gamification/components/XpCard';
import StreakCard from '../../features/gamification/components/StreakCard';
import AchievementCard from '../../features/gamification/components/AchievementCard';
import SimulateProgressButton from '../../features/gamification/components/SimulateProgressButton';
import WeightProgressCard from '../../features/dashboard/components/WeightProgressCard';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const GOAL_ICON: Record<string, string> = {
  WEIGHT_LOSS: '🔥',
  MUSCLE_GAIN: '💪',
  MAINTAIN_WEIGHT: '⚖️',
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return null;

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/8 bg-white/4 p-12">
          <span className="text-5xl">📊</span>
          <h1 className="mt-4 text-2xl font-bold text-white">No profile yet</h1>
          <p className="mt-2 text-gray-400">Set up your profile to start tracking XP, rank, and streaks.</p>
          <Link
            to={ROUTES.setup}
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors"
          >
            Set Up Profile →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Ambient orbs */}
      <div className="orb w-96 h-96 bg-violet-600/8 -top-20 -right-32" />
      <div className="orb w-64 h-64 bg-cyan-500/6 bottom-0 -left-16" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-sm text-gray-500 mb-1">Dashboard</p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Welcome back, <span className="text-gradient-violet">{profile.fullName}</span> 👋
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg">{GOAL_ICON[profile.goal] ?? '🎯'}</span>
            <span className="text-sm text-gray-400">
              Goal: <span className="text-gray-200 font-medium">{GOAL_LABEL[profile.goal] ?? profile.goal}</span>
            </span>
          </div>
        </div>
        <Link
          to={ROUTES.plan}
          className="flex-shrink-0 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20 transition-colors"
        >
          📋 View Plan →
        </Link>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {[
          <RankCard key="rank" />,
          <XpCard key="xp" />,
          <StreakCard key="streak" />,
          <WeightProgressCard key="weight" />,
          <AchievementCard key="achievements" />,
          <SimulateProgressButton key="simulate" />,
        ].map((card) => (
          <motion.div key={card.key} variants={cardVariant} className="card-hover">
            {card}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
