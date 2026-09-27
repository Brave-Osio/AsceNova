import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import { generateExerciseDetail, WORKOUT_PROMPT_VERSION, type EnrichedWorkoutDay } from './workoutGenerationService.js';
import * as dailyProgressService from './dailyProgressService.js';
import type { Profile, WorkoutSplitStyle, PlanSource } from '@prisma/client';

const ADHERENCE_WINDOW_DAYS = 14;

export interface AdherenceSummary {
  workoutCompletionRate: number | null;
  currentStreak: number;
  weightTrend: 'losing' | 'gaining' | 'stable' | 'unknown';
  onTrackForGoal: boolean | null;
}

/**
 * Feeds real logged activity into workout generation instead of just
 * static profile fields + variety-avoidance — returns null when there's
 * no history at all (brand-new user), so the prompt can omit the whole
 * section rather than print misleading zeros.
 */
async function buildAdherenceSummary(userId: string, profile: Profile): Promise<AdherenceSummary | null> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - ADHERENCE_WINDOW_DAYS);
  since.setUTCHours(0, 0, 0, 0);

  const [daysLogged, workoutsCompleted, recentLogs, userProgress] = await Promise.all([
    dailyProgressService.countLogsSince(userId, since),
    dailyProgressService.countMetricSince(userId, 'WORKOUTS_COMPLETED', since),
    prisma.dailyProgress.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
      select: { weightKg: true },
    }),
    prisma.userProgress.findUnique({ where: { userId } }),
  ]);

  if (daysLogged === 0) {
    return null;
  }

  let weightTrend: AdherenceSummary['weightTrend'] = 'unknown';
  let onTrackForGoal: boolean | null = null;
  if (recentLogs.length >= 2) {
    const weightChange = recentLogs[recentLogs.length - 1].weightKg - recentLogs[0].weightKg;
    weightTrend = weightChange < -0.2 ? 'losing' : weightChange > 0.2 ? 'gaining' : 'stable';

    if (profile.goal === 'WEIGHT_LOSS') onTrackForGoal = weightChange <= 0.2;
    else if (profile.goal === 'MUSCLE_GAIN') onTrackForGoal = weightChange >= -0.2;
    else onTrackForGoal = Math.abs(weightChange) <= 1;
  }

  return {
    workoutCompletionRate: workoutsCompleted / daysLogged,
    currentStreak: userProgress?.currentStreak ?? 0,
    weightTrend,
    onTrackForGoal,
  };
}

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
  const skeleton = buildWorkoutSplit(profile, style);
  const nutrition = buildNutritionTargets(profile);

  const previousPlan = await prisma.workoutPlan.findFirst({
    where: { userId, isActive: true },
    include: { workoutDays: { include: { exercises: true } } },
  });
  const priorExerciseNames = [
    ...new Set(previousPlan?.workoutDays.flatMap((d) => d.exercises.map((e) => e.name)) ?? []),
  ].slice(0, 20);
  const adherence = await buildAdherenceSummary(userId, profile);

  let source: PlanSource = 'RULE_BASED_LEGACY';
  let promptVersion: string | null = null;
  let enrichedDays: EnrichedWorkoutDay[] | null = null;

  try {
    enrichedDays = await generateExerciseDetail(profile, skeleton, priorExerciseNames, adherence);
    source = 'GEMINI';
    promptVersion = WORKOUT_PROMPT_VERSION;
  } catch (err) {
    // Fall back to the rule-based skeleton (no exercises) — a real,
    // already-tested plan rather than failing the request. `source`
    // stays RULE_BASED_LEGACY so this is fully visible in the data.
    console.error('Workout exercise generation failed, falling back to rule-based plan:', err);
  }

  const workoutDaysCreate = enrichedDays
    ? enrichedDays.map((d, i) => ({
        dayIndex: i,
        label: d.day,
        focus: d.focus,
        workoutName: d.workoutName,
        warmUp: d.warmUp,
        coolDown: d.coolDown,
        estimatedDurationMinutes: d.estimatedDurationMinutes,
        estimatedCaloriesBurned: d.estimatedCaloriesBurned,
        coachingTips: d.coachingTips,
        progressionAdvice: d.progressionAdvice,
        exercises:
          d.exercises.length > 0 ? { create: d.exercises.map((e, order) => ({ ...e, order })) } : undefined,
      }))
    : skeleton.map((d, i) => ({ dayIndex: i, label: d.day, focus: d.focus }));

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
        source,
        promptVersion,
        generatedAt: new Date(),
        workoutDays: { create: workoutDaysCreate },
        nutritionPlan: { create: nutrition },
      },
      include: {
        workoutDays: { orderBy: { dayIndex: 'asc' }, include: { exercises: { orderBy: { order: 'asc' } } } },
        nutritionPlan: true,
      },
    });
  });
}

export async function getActivePlan(userId: string) {
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId, isActive: true },
    include: {
      workoutDays: { orderBy: { dayIndex: 'asc' }, include: { exercises: { orderBy: { order: 'asc' } } } },
      nutritionPlan: true,
    },
  });
  if (!plan) {
    throw new HttpError(404, 'No active plan');
  }

  if (!plan.nutritionPlan) {
    // Backfill: plans generated while NutritionPlan briefly didn't exist in
    // the schema (see docs/ROADMAP.md "Phase 3") have no nutrition row yet.
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      const nutritionPlan = await prisma.nutritionPlan.create({
        data: { workoutPlanId: plan.id, ...buildNutritionTargets(profile) },
      });
      return { ...plan, nutritionPlan };
    }
  }

  return plan;
}
