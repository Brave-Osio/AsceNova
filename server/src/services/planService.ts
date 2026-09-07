import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import type { Profile, WorkoutSplitStyle } from '@prisma/client';

export interface GeneratedWorkoutDay {
  day: string;
  focus: string;
}

export interface GeneratedNutrition {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
  waterLiters: number;
}

const DEFAULT_SPLIT_STYLE: WorkoutSplitStyle = 'PUSH_PULL_LEGS';

/**
 * Rule-based generator, ported from the frontend's old fitnessService.ts.
 * Lives server-side now since GEMINI_API_KEY (its eventual replacement)
 * is backend-only — this function's body becomes an awaited Gemini call
 * later, but callers (generateAndSaveActivePlan) don't change.
 */
export function buildWorkoutSplit(profile: Profile, splitStyle: WorkoutSplitStyle): GeneratedWorkoutDay[] {
  const usesGym = profile.equipmentAccess === 'GYM' || profile.equipmentAccess === 'BOTH';
  const isWeightLoss = profile.goal === 'WEIGHT_LOSS';

  // Equipment-aware exercise framing: Push/Pull/Legs and Upper/Lower
  // assume gym-style isolation work. If the user picked one of those
  // without gym access, we keep their chosen STYLE (we don't override
  // their pick) but swap the focus labels to home-friendly equivalents.
  const homeOnly = !usesGym;

  if (splitStyle === 'PUSH_PULL_LEGS') {
    const push = homeOnly ? 'Push Day (Bodyweight)' : 'Push Day';
    const pull = homeOnly ? 'Pull Day (Bands/Bodyweight)' : 'Pull Day';
    const legs = homeOnly ? 'Leg Day (Bodyweight)' : 'Leg Day';
    return [
      { day: 'Monday', focus: push },
      { day: 'Tuesday', focus: pull },
      { day: 'Wednesday', focus: legs },
      { day: 'Thursday', focus: isWeightLoss ? 'Cardio Intervals' : 'Rest' },
      { day: 'Friday', focus: push },
      { day: 'Saturday', focus: pull },
      { day: 'Sunday', focus: 'Rest' },
    ];
  }

  if (splitStyle === 'UPPER_LOWER') {
    const upper = homeOnly ? 'Upper Body (Bodyweight)' : 'Upper Body';
    const lower = homeOnly ? 'Lower Body (Bodyweight)' : 'Lower Body';
    return [
      { day: 'Monday', focus: upper },
      { day: 'Tuesday', focus: lower },
      { day: 'Wednesday', focus: isWeightLoss ? 'Cardio + Core' : 'Rest' },
      { day: 'Thursday', focus: upper },
      { day: 'Friday', focus: lower },
      { day: 'Saturday', focus: isWeightLoss ? 'Cardio + Core' : 'Mobility + Core' },
      { day: 'Sunday', focus: 'Rest' },
    ];
  }

  // FULL_BODY
  const fullBody = homeOnly ? 'Full Body (Bodyweight)' : 'Full Body Strength';
  return [
    { day: 'Monday', focus: fullBody },
    { day: 'Tuesday', focus: isWeightLoss ? 'Cardio Intervals' : 'Light Cardio' },
    { day: 'Wednesday', focus: fullBody },
    { day: 'Thursday', focus: 'Rest' },
    { day: 'Friday', focus: fullBody },
    { day: 'Saturday', focus: isWeightLoss ? 'Cardio + Core' : 'Mobility + Core' },
    { day: 'Sunday', focus: 'Rest' },
  ];
}

export function buildNutritionTargets(profile: Profile): GeneratedNutrition {
  // Mifflin-St Jeor baseline, then adjusted by goal.
  const baseCalories =
    10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age + 200;

  const goalAdjustment: Record<Profile['goal'], number> = {
    WEIGHT_LOSS: -300,
    MUSCLE_GAIN: 300,
    MAINTAIN_WEIGHT: 0,
  };

  const calories = Math.round(baseCalories + goalAdjustment[profile.goal]);

  // Protein: ~2g/kg for muscle gain, ~1.8g/kg for weight loss, ~1.6g/kg for maintain
  const proteinMultiplier =
    profile.goal === 'MUSCLE_GAIN' ? 2.0 : profile.goal === 'WEIGHT_LOSS' ? 1.8 : 1.6;
  const proteinGrams = Math.round(profile.currentWeightKg * proteinMultiplier);

  // Fat: 25–30% of calories (higher for muscle gain)
  const fatCaloriePct = profile.goal === 'MUSCLE_GAIN' ? 0.3 : 0.25;
  const fatGrams = Math.round((calories * fatCaloriePct) / 9);

  // Carbs: remaining calories after protein + fat
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const carbsGrams = Math.round((calories - proteinCals - fatCals) / 4);

  // Sodium: 2000–2300 mg/day; slightly higher for active/muscle gain
  const sodiumMg = profile.goal === 'MUSCLE_GAIN' ? 2300 : 2000;

  // Water: ~40ml per kg bodyweight, plus 0.5L base
  const waterLiters = Math.round((profile.currentWeightKg * 0.04 + 0.5) * 10) / 10;

  return { calories, proteinGrams, carbsGrams, fatGrams, sodiumMg, waterLiters };
}

/**
 * Deactivates any current active plan and creates a new one — plans are
 * never updated in place, so WorkoutPlan.generatedAt/isActive naturally
 * keeps a full history (matches the @@index([userId, generatedAt])).
 */
export async function generateAndSaveActivePlan(userId: string, splitStyle?: WorkoutSplitStyle) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new HttpError(404, 'Set up your profile before generating a plan');
  }

  const style = splitStyle ?? DEFAULT_SPLIT_STYLE;
  const workoutDays = buildWorkoutSplit(profile, style);
  const nutrition = buildNutritionTargets(profile);

  return prisma.$transaction(async (tx) => {
    await tx.workoutPlan.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return tx.workoutPlan.create({
      data: {
        userId,
        splitStyle: style,
        isActive: true,
        source: 'RULE_BASED_LEGACY',
        generatedAt: new Date(),
        workoutDays: {
          create: workoutDays.map((d, i) => ({ dayIndex: i, label: d.day, focus: d.focus })),
        },
        nutritionPlan: { create: nutrition },
      },
      include: {
        workoutDays: { orderBy: { dayIndex: 'asc' } },
        nutritionPlan: true,
      },
    });
  });
}

export async function getActivePlan(userId: string) {
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId, isActive: true },
    include: {
      workoutDays: { orderBy: { dayIndex: 'asc' } },
      nutritionPlan: true,
    },
  });
  if (!plan) {
    throw new HttpError(404, 'No active plan');
  }
  return plan;
}
