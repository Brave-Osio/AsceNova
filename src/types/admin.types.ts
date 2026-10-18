export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type UserRole = 'USER' | 'COACH' | 'ADMIN';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  avgTotalXp: number;
  avgStreak: number;
  workoutCompletionRate: number;
  goalDistribution: { goal: string; count: number }[];
  adminUsers: number;
  signupsByDay: { date: string; count: number; total: number }[];
  /** Users with at least one daily check-in in the window (distinct, non-deleted accounts). */
  activeUsers7d: number;
  activeUsers30d: number;
  workoutPlansGenerated: number;
  totalWorkoutsCompleted: number;
  challengeParticipants: number;
  challengeCompletions: number;
  /** Last 30 UTC days, oldest first. */
  engagementByDay: { date: string; activeUsers: number; workoutsCompleted: number }[];
}

/** Deliberately minimal: id and username (the login name) only — no recovery email, name or profile data reaches the admin UI. */
export interface AdminUserListItem {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  userProgress: { totalXp: number; cachedRank: string } | null;
  checkIns: number;
  workoutsCompleted: number;
}

export interface AdminUserListResult {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserDetail {
  user: {
    id: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    createdAt: string;
    userProgress: {
      totalXp: number;
      currentStreak: number;
      longestStreak: number;
      cachedRank: string;
      lastLogDate: string | null;
    } | null;
  };
  checkIns: number;
  workoutPlans: number;
  workoutsCompleted: number;
  /** The assigned coach's id, or null. */
  coachId: string | null;
  /** Active client count for a coach; null for other roles. */
  clientCount: number | null;
}

export interface AdminCoach {
  id: string;
  email: string;
  status: AccountStatus;
  clientCount: number;
}

export interface AdminCoachClient {
  id: string;
  email: string;
  status: AccountStatus;
}

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'USER_SUSPEND'
  | 'USER_REACTIVATE'
  | 'USER_GRANT_ADMIN'
  | 'USER_REVOKE_ADMIN'
  | 'USER_DELETE'
  | 'ACHIEVEMENT_UPDATE'
  | 'USER_EXPORT'
  | 'USER_GRANT_COACH'
  | 'USER_REVOKE_COACH'
  | 'COACH_ASSIGN_CLIENT'
  | 'COACH_UNASSIGN_CLIENT'
  | 'COACH_VIEW_CLIENT_LIST'
  | 'COACH_VIEW_CLIENT_DASHBOARD';
export type AuditOutcome = 'SUCCESS' | 'FAILURE';

export interface AuditEvent {
  id: string;
  /** ISO 8601, UTC. */
  createdAt: string;
  actorId: string;
  /** Resolved when read; null if the account no longer exists. */
  actorUsername: string | null;
  action: AuditAction;
  targetType: string | null;
  targetId: string | null;
  targetUsername: string | null;
  outcome: AuditOutcome;
  description: string;
  requestId: string | null;
}

export interface AuditLogFilters {
  /** Username (partial) or administrator id. */
  actor?: string;
  action?: AuditAction;
  outcome?: AuditOutcome;
  /** ISO datetimes (UTC) — the page converts the picked calendar days into these bounds. */
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}

export interface AuditLogResult {
  events: AuditEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserFilters {
  search?: string;
  status?: AccountStatus;
  role?: UserRole;
  page: number;
  pageSize: number;
}

export interface AdminAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAchievementInput {
  title?: string;
  description?: string;
  icon?: string;
  xpReward?: number;
  isActive?: boolean;
}

export interface AiUsageDay {
  date: string;
  calls: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiUsage {
  model: string;
  configured: boolean;
  dailyLimit: number | null;
  todayTokens: number;
  todayCalls: number;
  series: AiUsageDay[];
}
