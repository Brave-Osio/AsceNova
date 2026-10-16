import { z } from 'zod';

/**
 * Numeric fields stay strings in the form (matching <input> values
 * directly — same convention TextField/the old useProfileForm used)
 * and are only parsed to numbers at submit time, in useProfileForm's
 * toProfileInput(). This avoids fighting a controlled number input
 * while typing and keeps ProfileFormValues a plain string-keyed type
 * with no RHF/zodResolver input-vs-output generic complexity.
 */
interface NumberStringOptions {
  required: boolean;
  /** Reject decimals (age, days per week). */
  integer?: boolean;
}

/**
 * One validator for every numeric form field. Each failure has its own
 * field-specific message, and nothing is silently clamped or coerced:
 * empty, non-numeric, negative, fractional (when `integer`) and
 * out-of-range input are all rejected as typed.
 */
const numberString = (min: number, max: number, label: string, { required, integer = false }: NumberStringOptions) =>
  z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      if (v === '') {
        if (required) ctx.addIssue({ code: 'custom', message: `${label} is required` });
        return;
      }
      const n = Number(v);
      if (!Number.isFinite(n)) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a number` });
      } else if (n < 0) {
        ctx.addIssue({ code: 'custom', message: `${label} cannot be negative` });
      } else if (integer && !Number.isInteger(n)) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a whole number` });
      } else if (n < min || n > max) {
        ctx.addIssue({ code: 'custom', message: `${label} must be between ${min} and ${max}` });
      }
    });

const requiredNumberString = (min: number, max: number, label: string, integer = false) =>
  numberString(min, max, label, { required: true, integer });

const optionalNumberString = (min: number, max: number, label: string, integer = false) =>
  numberString(min, max, label, { required: false, integer });

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
export const preferredWorkoutTimeOptions = ['MORNING', 'AFTERNOON', 'EVENING'] as const;

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  age: requiredNumberString(13, 100, 'Age', true),
  gender: z.enum(genderOptions),

  heightCm: requiredNumberString(100, 250, 'Height (cm)'),
  currentWeightKg: requiredNumberString(30, 300, 'Weight (kg)'),
  goalWeightKg: optionalNumberString(30, 300, 'Goal weight (kg)'),

  goal: z.enum(goalOptions),
  fitnessLevel: z.enum(fitnessLevelOptions),
  equipmentAccess: z.enum(equipmentAccessOptions),
  activityLevel: z.enum(activityLevelOptions),
  workoutFrequency: optionalNumberString(1, 7, 'Workout days per week', true),
  preferredSplitStyle: z.enum(splitStyleOptions),

  preferredWorkoutTime: z.enum(preferredWorkoutTimeOptions),
  sleepHoursTarget: optionalNumberString(3, 12, 'Sleep hours'),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;
