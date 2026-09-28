import { Swords } from 'lucide-react';
import { useChallenges } from '../../features/challenges/hooks/useChallenges';
import ChallengeCard from '../../features/challenges/components/ChallengeCard';
import CreateChallengeForm from '../../features/challenges/components/CreateChallengeForm';

export default function ChallengesPage() {
  const { invites, isLoading } = useChallenges();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div>
        <p className="text-sm text-brand-text-muted mb-1">Gamification</p>
        <h1 className="text-2xl font-extrabold text-brand-text sm:text-3xl">Challenges</h1>
        <p className="mt-2 text-brand-text-secondary">Start a weekly challenge, solo or with friends.</p>
      </div>

      <div className="mt-8">
        <CreateChallengeForm />
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-brand-text-muted">Loading…</p>
        ) : invites.length === 0 ? (
          <div className="card rounded-2xl p-8 text-center">
            <Swords size={32} className="mx-auto text-brand-text-muted" />
            <p className="mt-3 text-sm text-brand-text-secondary">No challenges yet — start one above.</p>
          </div>
        ) : (
          invites.map((invite) => <ChallengeCard key={invite.id} invite={invite} />)
        )}
      </div>
    </section>
  );
}
