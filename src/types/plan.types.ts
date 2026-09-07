export interface WorkoutDay {
  day: string; // e.g. "Monday"
  focus: string; // e.g. "Push Day", "Rest"
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
 * workoutDays/nutrition keep the flat shapes the UI already renders —
 * the richer optional Prisma fields (exercises, warm-up/cooldown, bmi/
 * bmr/tdee, etc.) aren't populated by the rule-based generator yet, so
 * they're not surfaced here until something actually produces them.
 */
export interface FitnessPlan {
  id: string;
  isActive: boolean;
  workoutDays: WorkoutDay[];
  nutrition: NutritionPlan;
  splitStyle: WorkoutSplitStyle;
  generatedAt: string; // ISO timestamp
}
