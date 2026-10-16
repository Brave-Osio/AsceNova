import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowRight, User } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { usePlanGenerator } from '../../features/fitness-plan/hooks/usePlanGenerator';
import WorkoutTable from '../../features/fitness-plan/components/WorkoutTable';
import NutritionPanel from '../../features/fitness-plan/components/NutritionPanel';
import SplitStylePicker from '../../features/fitness-plan/components/SplitStylePicker';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import type { WorkoutSplitStyle } from '../../types/plan.types';
import PageContainer from '../../components/layout/PageContainer';

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
        <div className="card rounded-3xl p-12">
          <User size={40} className="mx-auto text-brand-text-muted" />
          <h1 className="mt-4 text-2xl font-bold text-brand-text">No profile yet</h1>
          <p className="mt-2 text-brand-text-secondary">Set up your profile so we know what to plan for you.</p>
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

  if (isLoading || !plan) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-brand-text-secondary">Generating your personalized plan...</p>
        </div>
      </section>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="AI-Generated Plan"
        title="Your Fitness Plan"
        description={
          <>
            Tailored for <span className="font-semibold text-brand-text">{profile.fullName}</span>'s{' '}
            <span className="text-brand-primary-light">{profile.goal.replace(/_/g, ' ').toLowerCase()}</span> goal
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-8"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-text-muted">Nutrition Targets</h2>
        <NutritionPanel nutrition={plan.nutrition} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-text-muted">Workout Schedule</h2>

        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-text-muted">
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
          <RefreshCw size={14} /> Regenerate Plan
        </Button>
        <Link
          to={ROUTES.dashboard}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-light transition-colors"
        >
          Go to Dashboard <ArrowRight size={14} />
        </Link>
      </motion.div>
    </PageContainer>
  );
}
