import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Mail, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import PageContainer from '../../components/layout/PageContainer';
import { ROUTES } from '../../constants/routes';
import AccountInfoPanel from '../../features/settings/components/AccountInfoPanel';
import ChangePasswordForm from '../../features/settings/components/ChangePasswordForm';
import RecoveryEmailForm from '../../features/settings/components/RecoveryEmailForm';
import ProfileSetupForm from '../../features/profile/components/ProfileSetupForm';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { listContainer, listItem } from '../../lib/motion';

function SectionCard({ title, description, icon, children }: { title: string; description?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <motion.section variants={listItem} className="card rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary-light">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold text-brand-text">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-brand-text-secondary">{description}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/**
 * One page for profile and account settings. A user with no profile yet sees
 * it as onboarding (and is sent to their plan after saving); everyone else
 * just edits the same form in place, with no onboarding flow repeated.
 */
export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const isOnboarding = !isLoading && !profile;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Loading settings">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title={isOnboarding ? 'Set up your profile' : 'Profile and settings'}
        description={
          isOnboarding
            ? 'Tell us a bit about yourself so we can build your plan. You can change any of this later.'
            : 'Update your personal details and fitness preferences, and manage your account security.'
        }
      />

      <motion.div
        className={`mt-8 grid items-start gap-6 ${isOnboarding ? 'max-w-3xl' : 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]'}`}
        initial="hidden"
        animate="visible"
        variants={listContainer}
      >
        {/* Profile form is the main column; account and security sit beside it from lg and stack below on smaller screens. */}
        <SectionCard
          title="Profile and fitness preferences"
          description="Used to build your workout plan and nutrition targets."
          icon={<UserRound size={18} />}
        >
          <ProfileSetupForm
            submitLabel={isOnboarding ? 'Generate My Plan' : 'Save Changes'}
            redirectOnSave={isOnboarding}
          />
        </SectionCard>

        {!isOnboarding && (
          <div className="space-y-6">
            <motion.div variants={listItem}>
              <AccountInfoPanel />
            </motion.div>

            <SectionCard title="Recovery Gmail" description="Used to reset your password if you get locked out." icon={<Mail size={18} />}>
              <RecoveryEmailForm />
            </SectionCard>

            <SectionCard title="Change password" icon={<KeyRound size={18} />}>
              <ChangePasswordForm />
            </SectionCard>

            <motion.p variants={listItem} className="px-1 text-xs text-brand-text-muted">
              Read how we handle your data in the{' '}
              <Link to={ROUTES.terms} className="font-semibold text-brand-primary-light underline">
                Terms and Conditions
              </Link>
              .
            </motion.p>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
