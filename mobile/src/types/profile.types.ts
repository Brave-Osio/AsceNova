/** Mirrors the web app's src/types/profile.types.ts 1:1 — same API shape. */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type FitnessGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTAIN_WEIGHT';
export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EquipmentAccess = 'HOME' | 'GYM' | 'BOTH';
export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
export type WorkoutSplitStylePreference = 'PUSH_PULL_LEGS' | 'UPPER_LOWER' | 'FULL_BODY';
export type PreferredWorkoutTime = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface DailySchedule {
  preferredWorkoutTime?: PreferredWorkoutTime;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  birthday: string | null;
  age: number;
  gender: Gender | null;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number | null;
  goal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  equipmentAccess: EquipmentAccess;
  activityLevel: ActivityLevel | null;
  workoutFrequency: number | null;
  preferredSplitStyle: WorkoutSplitStylePreference | null;
  dailySchedule: DailySchedule | null;
  sleepHoursTarget: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ProfileInput = Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
