import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import PageContainer from '../../components/layout/PageContainer';
import { ShowHiddenToggle } from '../../components/ui/HideControls';
import { useHiddenIds } from '../../lib/useHiddenIds';
import { useChallenges } from '../../features/challenges/hooks/useChallenges';
import ChallengeCard from '../../features/challenges/components/ChallengeCard';
import CreateChallengeForm from '../../features/challenges/components/CreateChallengeForm';
import { listContainer, listItem, pageEnter } from '../../lib/motion';

export default function ChallengesPage() {
  const hidden = useHiddenIds('challenges');
  const [showHidden, setShowHidden] = useState(false);
  const { invites, isLoading } = useChallenges();

  const hiddenCount = invites.filter((x) => hidden.isHidden(x.id)).length;
  const visible = showHidden ? invites : invites.filter((x) => !hidden.isHidden(x.id));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Gamification"
        title="Challenges"
        description="Start a weekly challenge, solo or with friends."
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <motion.div className="lg:sticky lg:top-20" initial="hidden" animate="visible" variants={pageEnter}>
        <CreateChallengeForm />
      </motion.div>

      <div className="space-y-4">
      <ShowHiddenToggle count={hiddenCount} showing={showHidden} onToggle={() => setShowHidden((v) => !v)} />
      <motion.div className="space-y-4" initial="hidden" animate="visible" variants={listContainer}>
        {isLoading ? (
          <p className="text-sm text-brand-text-muted" role="status">
            Loading challenges
          </p>
        ) : visible.length === 0 ? (
          <motion.div variants={listItem} className="card rounded-2xl p-8 text-center">
            <Swords size={32} className="mx-auto text-brand-text-muted" />
            <p className="mt-3 text-sm text-brand-text-secondary">{invites.length === 0 ? "No challenges yet. Start one to get going." : "All of your challenges are hidden. Use Show hidden to see them."}</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {visible.map((invite) => (
              <motion.div
                key={invite.id}
                layout="position"
                variants={listItem}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -2 }}
              >
                <ChallengeCard
                  invite={invite}
                  isHidden={hidden.isHidden(invite.id)}
                  onHide={() => hidden.hide(invite.id)}
                  onUnhide={() => hidden.unhide(invite.id)}
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
