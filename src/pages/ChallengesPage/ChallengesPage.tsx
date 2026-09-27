import { useChallenges } from '../../features/challenges/hooks/useChallenges';
import ChallengeCard from '../../features/challenges/components/ChallengeCard';
import CreateChallengeForm from '../../features/challenges/components/CreateChallengeForm';

export default function ChallengesPage() {
  const { invites, isLoading } = useChallenges();

  return (
    <section className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="orb w-96 h-96 bg-violet-600/8 -top-20 -right-32" />

      <div>
        <p className="text-sm text-gray-500 mb-1">Gamification</p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Challenges</h1>
        <p className="mt-2 text-gray-400">Start a weekly challenge, solo or with friends.</p>
      </div>

      <div className="mt-8">
        <CreateChallengeForm />
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : invites.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <span className="text-4xl">⚔️</span>
            <p className="mt-3 text-sm text-gray-400">No challenges yet — start one above.</p>
          </div>
        ) : (
          invites.map((invite) => <ChallengeCard key={invite.id} invite={invite} />)
        )}
      </div>
    </section>
  );
}
