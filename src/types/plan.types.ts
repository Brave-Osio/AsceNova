export interface WorkoutDay {
  day: string; // e.g. "Monday"
  focus: string; // e.g. "Push Day", "Rest"
}

export type WorkoutSplitStyle = 'push_pull_legs' | 'upper_lower' | 'full_body';

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
    value: 'push_pull_legs',
    label: 'Push / Pull / Legs',
    description: 'Classic 3-way gym split, repeated across the week.',
  },
  {
    value: 'upper_lower',
    label: 'Upper / Lower',
    description: 'Alternates upper body and lower body days.',
  },
  {
    value: 'full_body',
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

export interface FitnessPlan {
  workoutDays: WorkoutDay[];
  nutrition: NutritionPlan;
  splitStyle: WorkoutSplitStyle;
  generatedAt: string; // ISO timestamp
}
