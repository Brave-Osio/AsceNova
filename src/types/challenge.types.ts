export type ChallengeMetric = 'WORKOUTS_COMPLETED' | 'WATER_GOAL_HITS' | 'PROTEIN_GOAL_HITS' | 'LOG_STREAK';
export type ChallengeInviteStatus = 'ACTIVE' | 'EXPIRED';
export type ChallengeParticipantStatus = 'INVITED' | 'ACCEPTED' | 'DECLINED';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  metric: ChallengeMetric;
  targetValue: number;
  periodDays: number;
  xpReward: number;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  status: ChallengeParticipantStatus;
  progressValue: number;
  completedAt: string | null;
  user: {
    id: string;
    email: string;
    profile: { fullName: string } | null;
  };
}

export interface ChallengeInvite {
  id: string;
  challengeId: string;
  createdByUserId: string;
  periodStart: string;
  periodEnd: string;
  status: ChallengeInviteStatus;
  createdAt: string;
  challenge: ChallengeTemplate;
  participants: ChallengeParticipant[];
}
