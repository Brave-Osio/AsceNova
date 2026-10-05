import type { FitnessGoal, FitnessLevel, WorkoutSplitStyle } from '@prisma/client';
import type { EnrichedWorkoutDay } from '../../services/workoutGenerationService.js';

export type BackupTemplateTag = 'LOW_IMPACT';

/**
 * A complete, hand-curated 7-day plan used only when Gemini generation fails.
 * `goals`/`levels` list who it suits best; `equipment` is what it requires
 * (HOME templates need no gym; GYM templates assume a full gym).
 */
export interface BackupTemplate {
  id: string;
  name: string;
  splitStyle: WorkoutSplitStyle;
  goals: FitnessGoal[];
  levels: FitnessLevel[];
  equipment: 'HOME' | 'GYM';
  /** Days with any training/recovery work (i.e. every non-Rest day). */
  daysPerWeek: number;
  tags: BackupTemplateTag[];
  days: EnrichedWorkoutDay[];
}

export interface TemplateSpec {
  slug: string;
  name: string;
  goals: FitnessGoal[];
  levels: FitnessLevel[];
  /** Level the exercise selection/volume is built for. */
  buildLevel: FitnessLevel;
  equipment: 'HOME' | 'GYM';
  trainDays: 3 | 4 | 5 | 6;
  lowImpact: boolean;
}
