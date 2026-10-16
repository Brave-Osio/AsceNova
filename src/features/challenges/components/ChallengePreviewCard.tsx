import { Clock, Sparkles, Target, Users } from 'lucide-react';
import { describeDuration, describeObjective, describeReward } from '../challengeInfo';
import type { ChallengeTemplate } from '../../../types/challenge.types';

/** Compact details for one challenge template. Shown in the hover/focus popover and in the always-visible selected panel. */
export default function ChallengePreviewCard({ challenge }: { challenge: ChallengeTemplate }) {
  const reward = describeReward(challenge);
  const rows = [
    { icon: Target, label: 'Objective', value: describeObjective(challenge) },
    { icon: Clock, label: 'Duration', value: describeDuration(challenge) },
    ...(reward ? [{ icon: Sparkles, label: 'Reward', value: reward }] : []),
    { icon: Users, label: 'Who can join', value: "Start solo, or invite friends by username. Each person's progress is tracked separately." },
  ];

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-bold text-brand-text">
        <span aria-hidden="true" className="text-base">
          {challenge.icon}
        </span>
        {challenge.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-brand-text-secondary">{challenge.description}</p>
      <dl className="mt-3 space-y-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2 text-xs">
            <Icon size={13} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-brand-primary-light" />
            <div>
              <dt className="sr-only">{label}</dt>
              <dd className="text-brand-text-secondary">
                <span className="font-semibold text-brand-text">{label}: </span>
                {value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
