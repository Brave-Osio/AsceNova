export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type UserRole = 'USER' | 'ADMIN';

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
}

export interface AdminUserListItem {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  profile: { fullName: string } | null;
  userProgress: { totalXp: number; cachedRank: string } | null;
}

export interface AdminUserListResult {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserDetailProfile {
  fullName: string;
  goal: string;
  fitnessLevel: string;
  currentWeightKg: number;
  goalWeightKg: number | null;
}

export interface AdminUserDetail {
  user: {
    id: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    createdAt: string;
    profile: AdminUserDetailProfile | null;
    userProgress: { totalXp: number; currentStreak: number; longestStreak: number; cachedRank: string } | null;
    workoutPlans: { id: string; splitStyle: string; workoutDays: { id: string }[] }[];
  };
  dailyProgressCount: number;
  chatMessageCount: number;
}

export interface AdminUserFilters {
  search?: string;
  status?: AccountStatus;
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
