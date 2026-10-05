import type { FitnessGoal, FitnessLevel, WorkoutSplitStyle } from '@prisma/client';
import { buildTemplate, GOAL_LABEL, GOAL_SLUG } from './backupTemplates/builder.js';
import type { BackupTemplate, TemplateSpec } from './backupTemplates/types.js';

export type { BackupTemplate } from './backupTemplates/types.js';

const GOALS: FitnessGoal[] = ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTAIN_WEIGHT'];
const LEVELS: FitnessLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const EQUIPMENT: Array<'HOME' | 'GYM'> = ['HOME', 'GYM'];
const LEVEL_LABEL: Record<FitnessLevel, string> = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' };

// Training days scale with experience; muscle-gain plans train one day more.
const TRAIN_DAYS: Record<FitnessLevel, Record<FitnessGoal, 3 | 4 | 5 | 6>> = {
  BEGINNER: { WEIGHT_LOSS: 3, MAINTAIN_WEIGHT: 3, MUSCLE_GAIN: 4 },
  INTERMEDIATE: { WEIGHT_LOSS: 4, MAINTAIN_WEIGHT: 4, MUSCLE_GAIN: 5 },
  ADVANCED: { WEIGHT_LOSS: 5, MAINTAIN_WEIGHT: 5, MUSCLE_GAIN: 6 },
};

/**
 * 20 specs per split: the full goal x level x equipment matrix (18) plus two
 * joint-friendly, low-impact plans (home + gym) for older or heavier users
 * and anyone who can't do jumping/impact work.
 */
const SPECS: TemplateSpec[] = [
  ...GOALS.flatMap((goal) =>
    LEVELS.flatMap((level) =>
      EQUIPMENT.map(
        (equipment): TemplateSpec => ({
          slug: `${GOAL_SLUG[goal]}-${level.slice(0, 3)}-${equipment}`,
          name: `${GOAL_LABEL[goal]} - ${LEVEL_LABEL[level]} - ${equipment === 'HOME' ? 'Home' : 'Gym'}`,
          goals: [goal],
          levels: [level],
          buildLevel: level,
          equipment,
          trainDays: TRAIN_DAYS[level][goal],
          lowImpact: false,
        }),
      ),
    ),
  ),
  ...EQUIPMENT.map(
    (equipment): TemplateSpec => ({
      slug: `LOWIMPACT-${equipment}`,
      name: `Low Impact & Joint Friendly - ${equipment === 'HOME' ? 'Home' : 'Gym'}`,
      goals: ['MAINTAIN_WEIGHT', 'WEIGHT_LOSS'],
      levels: ['BEGINNER', 'INTERMEDIATE'],
      buildLevel: 'BEGINNER',
      equipment,
      trainDays: 3,
      lowImpact: true,
    }),
  ),
];

const SPLITS: WorkoutSplitStyle[] = ['PUSH_PULL_LEGS', 'UPPER_LOWER', 'FULL_BODY'];

/** 60 complete 7-day plans: 20 for each split style. */
export const BACKUP_TEMPLATES: BackupTemplate[] = SPLITS.flatMap((split, splitIndex) =>
  SPECS.map((spec, specIndex) => buildTemplate(split, spec, specIndex, splitIndex)),
);
