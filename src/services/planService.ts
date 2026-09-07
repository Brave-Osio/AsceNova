import { AxiosError } from 'axios';
import { httpClient } from '../lib/httpClient';
import type { FitnessPlan, WorkoutSplitStyle } from '../types/plan.types';

interface ApiWorkoutDay {
  dayIndex: number;
  label: string;
  focus: string;
}

interface ApiNutritionPlan {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
  waterLiters: number;
}

interface ApiWorkoutPlan {
  id: string;
  isActive: boolean;
  splitStyle: WorkoutSplitStyle;
  generatedAt: string;
  workoutDays: ApiWorkoutDay[];
  nutritionPlan: ApiNutritionPlan;
}

function toFitnessPlan(plan: ApiWorkoutPlan): FitnessPlan {
  return {
    id: plan.id,
    isActive: plan.isActive,
    splitStyle: plan.splitStyle,
    generatedAt: plan.generatedAt,
    workoutDays: plan.workoutDays
      .slice()
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .map((d) => ({ day: d.label, focus: d.focus })),
    nutrition: {
      calories: plan.nutritionPlan.calories,
      proteinGrams: plan.nutritionPlan.proteinGrams,
      carbsGrams: plan.nutritionPlan.carbsGrams,
      fatGrams: plan.nutritionPlan.fatGrams,
      sodiumMg: plan.nutritionPlan.sodiumMg,
      waterLiters: plan.nutritionPlan.waterLiters,
    },
  };
}

/**
 * Thin wrapper over the plan API endpoints, mirroring authService.ts/
 * profileService.ts's "one exported function per concern" convention.
 */
export async function getActivePlan(): Promise<FitnessPlan | null> {
  try {
    const res = await httpClient.get<{ plan: ApiWorkoutPlan }>('/api/plans/active');
    return toFitnessPlan(res.data.plan);
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generatePlan(splitStyle?: WorkoutSplitStyle): Promise<FitnessPlan> {
  const res = await httpClient.post<{ plan: ApiWorkoutPlan }>('/api/plans', { splitStyle });
  return toFitnessPlan(res.data.plan);
}
