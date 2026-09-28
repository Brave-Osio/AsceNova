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
    <div className="card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{invite.challenge.icon}</span>
            <span className="font-bold text-brand-text">{invite.challenge.title}</span>
          </div>
          <p className="mt-1 text-sm text-brand-text-secondary">{invite.challenge.description}</p>
        </div>
        <span className={`chip whitespace-nowrap px-2 py-0.5 text-xs ${
          expired ? 'bg-brand-card-alt text-brand-text-muted' : 'chip-primary'
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
                <span className="text-brand-text-secondary">{p.user.profile?.fullName ?? p.user.email}</span>
                <span className="text-brand-text-muted">
                  {p.status === 'DECLINED'
                    ? 'Declined'
                    : p.status === 'INVITED'
                    ? 'Invited'
                    : `${p.progressValue}/${invite.challenge.targetValue}`}
                </span>
              </div>
              {p.status === 'ACCEPTED' && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-card-alt">
                  <div
                    className={`h-full rounded-full ${p.completedAt ? 'bg-emerald-500' : 'bg-brand-primary'}`}
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
