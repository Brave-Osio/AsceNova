export type ExerciseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface WorkoutExercise {
  id: string;
  order: number;
  name: string;
  sets: number;
  reps: string; // e.g. "8-10", "12", "Failure"
  restSeconds: number;
  tempo?: string | null;
  targetMuscles: string[];
  difficulty?: ExerciseDifficulty | null;
  estimatedCalories?: number | null;
  equipment?: string | null;
  notes?: string | null;
}

export interface WorkoutDay {
  day: string; // e.g. "Monday"
  focus: string; // e.g. "Push Day", "Rest"
  /**
   * Populated when the active plan's source is Gemini-generated
   * (server/src/services/workoutGenerationService.ts). Rule-based
   * fallback plans omit these — WorkoutTable renders the simple pill
   * view in that case.
   */
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

/**
 * Presented in the split-style picker on the Plan page. Kept as data
 * (not hardcoded into the UI) so adding a new split style later is one
 * entry here, not a change scattered across components.
 */
export const SPLIT_STYLE_OPTIONS: SplitStyleOption[] = [
  {
    value: 'PUSH_PULL_LEGS',
    label: 'Push / Pull / Legs',
    description: 'Classic 3-way gym split, repeated across the week.',
  },
  {
    value: 'UPPER_LOWER',
    label: 'Upper / Lower',
    description: 'Alternates upper body and lower body days.',
  },
  {
    value: 'FULL_BODY',
    label: 'Full Body',
    description: 'Trains your whole body each session — efficient with fewer days.',
  },
];

export interface NutritionPlan {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
  waterLiters: number;
}

/**
 * Mirrors the WorkoutPlan API response shape (server/src/services/planService.ts).
 * workoutDays carries exercise-level detail when the plan was Gemini-generated
 * (see WorkoutDay above).
 */
export interface FitnessPlan {
  id: string;
  isActive: boolean;
  workoutDays: WorkoutDay[];
  nutrition: NutritionPlan;
  splitStyle: WorkoutSplitStyle;
  generatedAt: string; // ISO timestamp
}
