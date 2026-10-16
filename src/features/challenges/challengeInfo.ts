import type { ChallengeTemplate } from '../../types/challenge.types';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Plain-language completion criteria, derived only from the template's metric and targetValue. */
export function describeObjective(challenge: ChallengeTemplate): string {
  const n = challenge.targetValue;
  switch (challenge.metric) {
    case 'WORKOUTS_COMPLETED':
      return `Complete ${plural(n, 'workout')}`;
    case 'WATER_GOAL_HITS':
      return `Hit your water goal on ${plural(n, 'day')}`;
    case 'PROTEIN_GOAL_HITS':
      return `Hit your protein goal on ${plural(n, 'day')}`;
    case 'LOG_STREAK':
      return `Reach a ${n}-day logging streak`;
  }
}

export function describeDuration(challenge: ChallengeTemplate): string {
  return `${plural(challenge.periodDays, 'day')} from the day you start`;
}

export function describeReward(challenge: ChallengeTemplate): string | null {
  return challenge.xpReward > 0 ? `+${challenge.xpReward} XP when you complete it` : null;
}
