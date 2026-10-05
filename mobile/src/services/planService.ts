import { AxiosError } from 'axios';
import { httpClient } from '../lib/httpClient';
import type { FitnessPlan, WorkoutSplitStyle, WorkoutExercise } from '../types/plan.types';

interface ApiWorkoutExercise {
  id: string;
  order: number;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo: string | null;
  targetMuscles: string[];
  difficulty: WorkoutExercise['difficulty'];
  estimatedCalories: number | null;
  equipment: string | null;
  notes: string | null;
}

interface ApiWorkoutDay {
  dayIndex: number;
  label: string;
  focus: string;
  workoutName: string | null;
  warmUp: string | null;
  coolDown: string | null;
  estimatedDurationMinutes: number | null;
  estimatedCaloriesBurned: number | null;
  coachingTips: string[];
  progressionAdvice: string | null;
  exercises: ApiWorkoutExercise[];
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

/** Mirrors the web app's src/services/planService.ts. */
function toFitnessPlan(plan: ApiWorkoutPlan): FitnessPlan {
  return {
    id: plan.id,
    isActive: plan.isActive,
    splitStyle: plan.splitStyle,
    generatedAt: plan.generatedAt,
    workoutDays: plan.workoutDays
      .slice()
      .sort((a, b) => a.dayIndex - b.dayIndex)
      .map((d) => ({
        day: d.label,
        focus: d.focus,
        workoutName: d.workoutName,
        warmUp: d.warmUp,
        coolDown: d.coolDown,
        estimatedDurationMinutes: d.estimatedDurationMinutes,
        estimatedCaloriesBurned: d.estimatedCaloriesBurned,
        coachingTips: d.coachingTips,
        progressionAdvice: d.progressionAdvice,
        exercises: d.exercises,
      })),
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

export interface GeneratedPlanResult {
  plan: FitnessPlan;
  /** True when AI generation failed and a pre-made backup plan was used instead. */
  usedBackup: boolean;
}

export async function generatePlan(splitStyle?: WorkoutSplitStyle): Promise<GeneratedPlanResult> {
  const res = await httpClient.post<{ plan: ApiWorkoutPlan; usedBackup?: boolean }>('/api/plans', { splitStyle });
  return { plan: toFitnessPlan(res.data.plan), usedBackup: res.data.usedBackup === true };
}
