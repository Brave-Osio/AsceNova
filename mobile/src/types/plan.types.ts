/** Mirrors the web app's src/types/plan.types.ts. */
export type ExerciseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface WorkoutExercise {
  id: string;
  order: number;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo?: string | null;
  targetMuscles: string[];
  difficulty?: ExerciseDifficulty | null;
  estimatedCalories?: number | null;
  equipment?: string | null;
  notes?: string | null;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  workoutName?: string | null;
  warmUp?: string | null;
  coolDown?: string | null;
  estimatedDurationMinutes?: number | null;
  estimatedCaloriesBurned?: number | null;
  coachingTips?: string[];
  progressionAdvice?: string | null;
  exercises?: WorkoutExercise[];
}

export type WorkoutSplitStyle = 'PUSH_PULL_LEGS' | 'UPPER_LOWER' | 'FULL_BODY';

export interface SplitStyleOption {
  value: WorkoutSplitStyle;
  label: string;
  description: string;
}

/** Same copy as the web's SPLIT_STYLE_OPTIONS. */
export const SPLIT_STYLE_OPTIONS: SplitStyleOption[] = [
  { value: 'PUSH_PULL_LEGS', label: 'Push / Pull / Legs', description: 'Classic 3-way gym split, repeated across the week.' },
  { value: 'UPPER_LOWER', label: 'Upper / Lower', description: 'Alternates upper body and lower body days.' },
  { value: 'FULL_BODY', label: 'Full Body', description: 'Trains your whole body each session — efficient with fewer days.' },
];

export interface NutritionPlan {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
  waterLiters: number;
}

export interface FitnessPlan {
  id: string;
  isActive: boolean;
  workoutDays: WorkoutDay[];
  nutrition: NutritionPlan;
  splitStyle: WorkoutSplitStyle;
  generatedAt: string;
}
