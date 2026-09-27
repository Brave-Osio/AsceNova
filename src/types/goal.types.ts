export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type FitnessGoalType = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTAIN_WEIGHT';

export interface Goal {
  id: string;
  goalType: FitnessGoalType;
  targetValue: number | null;
  targetDate: string | null;
  status: GoalStatus;
  progressNote: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateGoalInput {
  goalType: FitnessGoalType;
  targetValue?: number;
  targetDate?: string;
  progressNote?: string;
}

export interface UpdateGoalInput {
  targetValue?: number;
  targetDate?: string;
  progressNote?: string;
}
