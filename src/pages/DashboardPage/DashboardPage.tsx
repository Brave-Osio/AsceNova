import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Scale, ClipboardList, Target } from 'lucide-react';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { useUserProgress } from '../../features/gamification/hooks/useUserProgress';
import { getEquippedTitle } from '../../constants/titles';
import { ROUTES } from '../../constants/routes';
import RankCard from '../../features/gamification/components/RankCard';
import XpCard from '../../features/gamification/components/XpCard';
import StreakCard from '../../features/gamification/components/StreakCard';
import AchievementCard from '../../features/gamification/components/AchievementCard';
import SimulateProgressButton from '../../features/gamification/components/SimulateProgressButton';
import WeightProgressCard from '../../features/dashboard/components/WeightProgressCard';
import NextWorkoutCard from '../../features/dashboard/components/NextWorkoutCard';
import TodayTargetsCard from '../../features/dashboard/components/TodayTargetsCard';
import WeeklySummaryCard from '../../features/dashboard/components/WeeklySummaryCard';
import WorkoutCalendarCard from '../../features/dashboard/components/WorkoutCalendarCard';
import CoachTeaserCard from '../../features/dashboard/components/CoachTeaserCard';

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const GOAL_ICON: Record<string, typeof Flame> = {
  WEIGHT_LOSS: Flame,
  MUSCLE_GAIN: Dumbbell,
  MAINTAIN_WEIGHT: Scale,
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { data: profile, isLoading } = useProfile();
  const { unlockedAchievementIds } = useUserProgress();
  const equippedTitle = getEquippedTitle(unlockedAchievementIds);

  if (isLoading) return null;

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card rounded-3xl p-12">
          <Target size={40} className="mx-auto text-brand-text-muted" />
          <h1 className="mt-4 text-2xl font-bold text-brand-text">No profile yet</h1>
          <p className="mt-2 text-brand-text-secondary">Set up your profile to start tracking XP, rank, and streaks.</p>
          <Link
            to={ROUTES.setup}
            className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-bold text-white hover:bg-brand-primary-light transition-colors"
          >
            Set Up Profile
          </Link>
        </div>
      </section>
    );
  }

  const GoalIcon = GOAL_ICON[profile.goal] ?? Target;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-sm text-brand-text-muted mb-1">Dashboard</p>
          <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">
            Welcome back, {profile.fullName}
          </h1>
          {equippedTitle && (
            <span className="mt-1.5 inline-flex items-center gap-1 chip chip-accent px-2.5 py-0.5 text-xs">
              {equippedTitle}
            </span>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <GoalIcon size={15} className="text-brand-text-secondary" />
            <span className="text-sm text-brand-text-secondary">
              Goal: <span className="text-brand-text font-medium">{GOAL_LABEL[profile.goal] ?? profile.goal}</span>
            </span>
          </div>
        </div>
        <Link
          to={ROUTES.plan}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-brand-card-alt px-4 py-2 text-xs font-bold text-brand-primary-light hover:bg-brand-card transition-colors"
        >
          <ClipboardList size={14} /> View Plan
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
          <NextWorkoutCard key="next-workout" />,
          <TodayTargetsCard key="today-targets" />,
          <RankCard key="rank" />,
          <XpCard key="xp" />,
          <StreakCard key="streak" />,
          <WeightProgressCard key="weight" />,
          <WorkoutCalendarCard key="calendar" />,
          <AchievementCard key="achievements" />,
          <CoachTeaserCard key="coach" />,
          <WeeklySummaryCard key="weekly" />,
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
