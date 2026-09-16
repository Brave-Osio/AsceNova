export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type FitnessGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTAIN_WEIGHT';
export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EquipmentAccess = 'HOME' | 'GYM' | 'BOTH';
export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE';
export type WorkoutSplitStylePreference = 'PUSH_PULL_LEGS' | 'UPPER_LOWER' | 'FULL_BODY';
export type PreferredWorkoutTime = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface DailySchedule {
  preferredWorkoutTime?: PreferredWorkoutTime;
}

/**
 * Mirrors the Prisma `Profile` model's field names and enum values 1:1
 * (no translation layer) since this is exactly the shape the API
 * returns as JSON.
 */
export interface Profile {
  id: string;
  userId: string;

  fullName: string;
  birthday: string | null; // ISO date string
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

/**
 * Input shape for creating/updating a profile — only the fields the
 * onboarding form actually collects; the server fills id/userId/timestamps.
 */
export type ProfileInput = Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
