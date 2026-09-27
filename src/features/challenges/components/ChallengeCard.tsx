import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import { useChallengeActions } from '../hooks/useChallengeActions';
import type { ChallengeInvite } from '../../../types/challenge.types';

function daysLeft(periodEnd: string): number {
  return Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function ChallengeCard({ invite }: { invite: ChallengeInvite }) {
  const { user } = useAuth();
  const { respond, pendingInviteId } = useChallengeActions();

  const mine = invite.participants.find((p) => p.userId === user?.id);
  const isPending = pendingInviteId === invite.id;
  const expired = invite.status === 'EXPIRED';

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{invite.challenge.icon}</span>
            <span className="font-bold text-white">{invite.challenge.title}</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">{invite.challenge.description}</p>
        </div>
        <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold ${
          expired ? 'border-gray-500/30 bg-gray-500/10 text-gray-400' : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
        }`}>
          {expired ? 'Ended' : `${daysLeft(invite.periodEnd)}d left`}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {invite.participants.map((p) => {
          const pct = Math.min(100, Math.round((p.progressValue / invite.challenge.targetValue) * 100));
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{p.user.profile?.fullName ?? p.user.email}</span>
                <span className="text-gray-500">
                  {p.status === 'DECLINED'
                    ? 'Declined'
                    : p.status === 'INVITED'
                    ? 'Invited'
                    : `${p.progressValue}/${invite.challenge.targetValue}`}
                </span>
              </div>
              {p.status === 'ACCEPTED' && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${p.completedAt ? 'bg-emerald-500' : 'bg-violet-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mine?.status === 'INVITED' && !expired && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" loading={isPending} onClick={() => respond(invite.id, true)}>
            Accept
          </Button>
          <Button size="sm" variant="ghost" loading={isPending} onClick={() => respond(invite.id, false)}>
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
