import type { Profile } from '../types/profile.types';
import type { FitnessPlan, WorkoutDay, NutritionPlan, WorkoutSplitStyle } from '../types/plan.types';

/**
 * generatePlan(profile, splitStyle) is the ONLY function callers ever
 * invoke from this service. Today it builds a plan from simple rules
 * based on goal/fitnessLevel/equipmentAccess AND the user-chosen split
 * style. Later, this function's body becomes an awaited Gemini API call
 * — but its signature does not change, so PlanGeneratorPage never needs
 * to know which is happening.
 *
 * splitStyle defaults to 'push_pull_legs' so existing callers that don't
 * pass one (or plans generated before this feature existed) still work.
 */
export async function generatePlan(
  profile: Profile,
  splitStyle: WorkoutSplitStyle = 'push_pull_legs',
): Promise<FitnessPlan> {
  const workoutDays = buildWorkoutSplit(profile, splitStyle);
  const nutrition = buildNutritionTargets(profile);

  return {
    workoutDays,
    nutrition,
    splitStyle,
    generatedAt: new Date().toISOString(),
  };
}

function buildWorkoutSplit(profile: Profile, splitStyle: WorkoutSplitStyle): WorkoutDay[] {
  const usesGym = profile.equipmentAccess === 'GYM' || profile.equipmentAccess === 'BOTH';
  const isWeightLoss = profile.goal === 'WEIGHT_LOSS';

  // Equipment-aware exercise framing: Push/Pull/Legs and Upper/Lower
  // assume gym-style isolation work. If the user picked one of those
  // without gym access, we keep their chosen STYLE (we don't override
  // their pick) but swap the focus labels to home-friendly equivalents.
  const homeOnly = !usesGym;

  if (splitStyle === 'push_pull_legs') {
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

  if (splitStyle === 'upper_lower') {
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

  // full_body
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

function buildNutritionTargets(profile: Profile): NutritionPlan {
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
  const fatCaloriePct = profile.goal === 'MUSCLE_GAIN' ? 0.30 : 0.25;
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
