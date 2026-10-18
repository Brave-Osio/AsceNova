export type CoachingAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type CoachingUserRole = 'USER' | 'COACH' | 'ADMIN';

/** Row in the coach's client list. Deliberately small: username and gamification totals only. */
export interface CoachClientListItem {
  id: string;
  username: string;
  role: CoachingUserRole;
  status: CoachingAccountStatus;
  totalXp: number;
  rank: string;
  currentStreak: number;
  /** YYYY-MM-DD of the latest check-in, or null if none. */
  lastLogDate: string | null;
}

export interface CoachClientListResult {
  clients: CoachClientListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CoachClientFilters {
  search?: string;
  page: number;
  pageSize: number;
}

export interface ClientActivityDay {
  date: string;
  workoutCompleted: boolean;
  hitWaterGoal: boolean;
  hitProteinGoal: boolean;
  slept7PlusHours: boolean;
  reachedStepGoal: boolean;
}

export interface ClientGoal {
  id: string;
  goalType: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  targetDate: string | null;
  completedAt: string | null;
}

/**
 * Read-only snapshot a coach (or admin) sees. By design it carries no weight/body metrics, notes,
 * contact details, plan or chat content — the server never sends them.
 */
export interface ClientDashboard {
  client: { id: string; username: string; role: CoachingUserRole; memberSince: string };
  focus: { fitnessGoal: string; fitnessLevel: string } | null;
  progress: { totalXp: number; rank: string; currentStreak: number; longestStreak: number; lastLogDate: string | null };
  totals: { checkIns: number; workoutsCompleted: number; achievementsUnlocked: number };
  /** Last 30 days, oldest first; only days that were logged. */
  activity: ClientActivityDay[];
  goals: ClientGoal[];
}
