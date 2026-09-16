import { z } from 'zod';
import {
  Gender,
  FitnessGoal,
  FitnessLevel,
  EquipmentAccess,
  ActivityLevel,
  WorkoutSplitStyle,
} from '@prisma/client';

const dailyScheduleSchema = z
  .object({
    preferredWorkoutTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).optional(),
  })
  .optional();

/** Treats an empty string as "not provided" so optional numeric fields aren't coerced to 0. */
const optionalNumber = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : v),
    z.coerce.number().min(min, `${label} must be between ${min} and ${max}`).max(max, `${label} must be between ${min} and ${max}`).optional(),
  );

export const upsertProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  birthday: z.preprocess((v) => (v === '' || v === undefined ? undefined : v), z.coerce.date().optional()),
  age: z.coerce.number().int().min(13, 'Age must be between 13 and 100').max(100, 'Age must be between 13 and 100'),
  gender: z.nativeEnum(Gender).optional(),

  heightCm: z.coerce.number().min(100, 'Height must be between 100 and 250 cm').max(250, 'Height must be between 100 and 250 cm'),
  currentWeightKg: z.coerce.number().min(30, 'Weight must be between 30 and 300 kg').max(300, 'Weight must be between 30 and 300 kg'),
  goalWeightKg: optionalNumber(30, 300, 'Goal weight'),

  goal: z.nativeEnum(FitnessGoal),
  fitnessLevel: z.nativeEnum(FitnessLevel),
  equipmentAccess: z.nativeEnum(EquipmentAccess),
  activityLevel: z.nativeEnum(ActivityLevel).optional(),
  workoutFrequency: optionalNumber(1, 7, 'Workout frequency'),
  preferredSplitStyle: z.nativeEnum(WorkoutSplitStyle).optional(),

  dailySchedule: dailyScheduleSchema,
  sleepHoursTarget: optionalNumber(0, 24, 'Sleep hours'),
});
export type UpsertProfileInput = z.infer<typeof upsertProfileSchema>;
