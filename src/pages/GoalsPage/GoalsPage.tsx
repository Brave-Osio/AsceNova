import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Target } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import PageContainer from '../../components/layout/PageContainer';
import { ShowHiddenToggle } from '../../components/ui/HideControls';
import { useHiddenIds } from '../../lib/useHiddenIds';
import { useGoals } from '../../features/goals/hooks/useGoals';
import GoalCard from '../../features/goals/components/GoalCard';
import GoalForm from '../../features/goals/components/GoalForm';
import { listContainer, listItem, pageEnter } from '../../lib/motion';

export default function GoalsPage() {
  const hidden = useHiddenIds('goals');
  const [showHidden, setShowHidden] = useState(false);
  const { goals, isLoading } = useGoals();

  const hiddenCount = goals.filter((x) => hidden.isHidden(x.id)).length;
  const visible = showHidden ? goals : goals.filter((x) => !hidden.isHidden(x.id));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Progress"
        title="Goals"
        description="Set a target and track it separately from your everyday habits."
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <motion.div className="lg:sticky lg:top-20" initial="hidden" animate="visible" variants={pageEnter}>
        <GoalForm />
      </motion.div>

      <div className="space-y-4">
      <ShowHiddenToggle count={hiddenCount} showing={showHidden} onToggle={() => setShowHidden((v) => !v)} />
      <motion.div className="space-y-4" initial="hidden" animate="visible" variants={listContainer}>
        {isLoading ? (
          <p className="text-sm text-brand-text-muted" role="status">
            Loading goals
          </p>
        ) : visible.length === 0 ? (
          <motion.div variants={listItem} className="card rounded-2xl p-8 text-center">
            <Target size={32} className="mx-auto text-brand-text-muted" />
            <p className="mt-3 text-sm text-brand-text-secondary">{goals.length === 0 ? "No goals yet. Create your first one." : "All of your goals are hidden. Use Show hidden to see them."}</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {visible.map((goal) => (
              <motion.div
                key={goal.id}
                layout="position"
                variants={listItem}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -2 }}
              >
                <GoalCard
                  goal={goal}
                  isHidden={hidden.isHidden(goal.id)}
                  onHide={() => hidden.hide(goal.id)}
                  onUnhide={() => hidden.unhide(goal.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
      </div>
      </div>
    </PageContainer>
  );
}
