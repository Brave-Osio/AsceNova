import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants/routes';
import { usePlanGenerator } from '../../features/fitness-plan/hooks/usePlanGenerator';
import WorkoutTable from '../../features/fitness-plan/components/WorkoutTable';
import NutritionPanel from '../../features/fitness-plan/components/NutritionPanel';
import SplitStylePicker from '../../features/fitness-plan/components/SplitStylePicker';
import Button from '../../components/ui/Button';
import type { WorkoutSplitStyle } from '../../types/plan.types';

export default function PlanGeneratorPage() {
  const { plan, profile, isLoading, regenerate } = usePlanGenerator();
  const [selectedStyle, setSelectedStyle] = useState<WorkoutSplitStyle>(plan?.splitStyle ?? 'PUSH_PULL_LEGS');

  // Keep the picker in sync with whatever style the active plan actually
  // used, so reopening the page doesn't silently show a different selection
  // than what generated the plan you're looking at. Adjusted during render
  // (React's documented pattern for deriving state from a changed prop)
  // rather than in an effect, to avoid an extra cascading render.
  const [lastPlanId, setLastPlanId] = useState(plan?.id);
  if (plan && plan.id !== lastPlanId) {
    setLastPlanId(plan.id);
    setSelectedStyle(plan.splitStyle ?? 'PUSH_PULL_LEGS');
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/4 p-12">
          <span className="text-5xl">👤</span>
          <h1 className="mt-4 text-2xl font-bold text-white">No profile yet</h1>
          <p className="mt-2 text-gray-400">Set up your profile so we know what to plan for you.</p>
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

  if (isLoading || !plan) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-gray-400">Generating your personalized plan...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-3xl px-4 py-12 sm:py-16">
      {/* Background orbs */}
      <div className="orb w-80 h-80 bg-violet-600/10 -top-20 -right-32" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mb-3">
              ✨ AI-Generated Plan
            </span>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Your Fitness Plan</h1>
            <p className="mt-1.5 text-gray-400">
              Tailored for <span className="text-white font-semibold">{profile.fullName}</span>'s{' '}
              <span className="text-violet-300">{profile.goal.replace(/_/g, ' ').toLowerCase()}</span> goal
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-violet-500/50 to-transparent" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Nutrition Targets</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-violet-500/50 to-transparent" />
        </div>
        <NutritionPanel nutrition={plan.nutrition} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Workout Schedule</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/50 to-transparent" />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Split Style
          </p>
          <SplitStylePicker selected={selectedStyle} onSelect={setSelectedStyle} />
        </div>

        <WorkoutTable workoutDays={plan.workoutDays} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <Button onClick={() => regenerate(selectedStyle)} variant="secondary">
          🔄 Regenerate Plan
        </Button>
        <Link
          to={ROUTES.dashboard}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors"
        >
          Go to Dashboard →
        </Link>
      </motion.div>
    </section>
  );
}
