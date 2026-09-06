import { z } from 'zod';

/**
 * Numeric fields stay strings in the form (matching <input> values
 * directly — same convention TextField/the old useProfileForm used)
 * and are only parsed to numbers at submit time, in useProfileForm's
 * toProfileInput(). This avoids fighting a controlled number input
 * while typing and keeps ProfileFormValues a plain string-keyed type
 * with no RHF/zodResolver input-vs-output generic complexity.
 */
const requiredNumberString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((v) => !Number.isNaN(Number(v)), `${label} must be a number`)
    .refine((v) => Number(v) >= min && Number(v) <= max, `${label} must be between ${min} and ${max}`);

const optionalNumberString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || !Number.isNaN(Number(v)), `${label} must be a number`)
    .refine(
      (v) => v === '' || (Number(v) >= min && Number(v) <= max),
      `${label} must be between ${min} and ${max}`,
    );

export const genderOptions = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
export const goalOptions = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTAIN_WEIGHT'] as const;
export const fitnessLevelOptions = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export const equipmentAccessOptions = ['HOME', 'GYM', 'BOTH'] as const;
export const activityLevelOptions = [
  'SEDENTARY',
  'LIGHTLY_ACTIVE',
  'MODERATELY_ACTIVE',
  'VERY_ACTIVE',
  'EXTRA_ACTIVE',
] as const;
export const splitStyleOptions = ['PUSH_PULL_LEGS', 'UPPER_LOWER', 'FULL_BODY'] as const;
export const foodPreferenceOptions = [
  'OMNIVORE',
  'VEGETARIAN',
  'VEGAN',
  'PESCATARIAN',
  'HALAL',
  'KETO',
  'OTHER',
] as const;
export const preferredWorkoutTimeOptions = ['MORNING', 'AFTERNOON', 'EVENING'] as const;

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  birthday: z.string().trim(), // 'YYYY-MM-DD' from <input type="date">, or ''
  age: requiredNumberString(13, 100, 'Age'),
  gender: z.enum(genderOptions),

  heightCm: requiredNumberString(100, 250, 'Height'),
  currentWeightKg: requiredNumberString(30, 300, 'Weight'),
  goalWeightKg: optionalNumberString(30, 300, 'Goal weight'),

  goal: z.enum(goalOptions),
  fitnessLevel: z.enum(fitnessLevelOptions),
  equipmentAccess: z.enum(equipmentAccessOptions),
  activityLevel: z.enum(activityLevelOptions),
  workoutFrequency: optionalNumberString(1, 7, 'Workout frequency'),
  preferredSplitStyle: z.enum(splitStyleOptions),

  foodPreference: z.enum(foodPreferenceOptions),
  foodAllergies: z.array(z.string()),
  medicalRestrictions: z.array(z.string()),
  preferredWorkoutTime: z.enum(preferredWorkoutTimeOptions),
  sleepHoursTarget: optionalNumberString(0, 24, 'Sleep hours'),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;
