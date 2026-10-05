import type { FitnessGoal, FitnessLevel, WorkoutSplitStyle } from '@prisma/client';
import type { EnrichedWorkoutDay } from '../../services/workoutGenerationService.js';
import { EXERCISE_POOLS, type PoolExercise, type PoolKey } from './exercisePools.js';
import type { BackupTemplate, TemplateSpec } from './types.js';

type StrengthKind = 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL';
type DayKind = StrengthKind | 'CARDIO' | 'RECOVERY' | 'REST';
// X = goal filler (cardio / recovery / rest), C = cardio only when losing weight,
// GPUSH/GFULL = an extra strength day only when building muscle (else the filler).
type Token = DayKind | 'X' | 'C' | 'GPUSH' | 'GFULL';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const LEVEL_NUM: Record<FitnessLevel, 1 | 2 | 3> = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };
const COMPOUND_POOLS: PoolKey[] = ['squat', 'hinge', 'lunge', 'pushH', 'pushV', 'pullV', 'pullH'];

const SLOTS: Record<StrengthKind, PoolKey[]> = {
  PUSH: ['pushH', 'pushV', 'pushH', 'pushAcc', 'pushAcc', 'core'],
  PULL: ['pullV', 'pullH', 'pullH', 'pullAcc', 'pullAcc', 'core'],
  LEGS: ['squat', 'hinge', 'lunge', 'lowerAcc', 'lowerAcc', 'core'],
  UPPER: ['pushH', 'pullH', 'pushV', 'pullV', 'pushAcc', 'pullAcc'],
  LOWER: ['squat', 'hinge', 'lunge', 'lowerAcc', 'core', 'lowerAcc'],
  FULL: ['squat', 'pushH', 'hinge', 'pullH', 'pushV', 'core'],
};

const LAYOUTS: Record<WorkoutSplitStyle, Record<3 | 4 | 5 | 6, Token[]>> = {
  PUSH_PULL_LEGS: {
    3: ['PUSH', 'REST', 'PULL', 'REST', 'LEGS', 'X', 'REST'],
    4: ['PUSH', 'PULL', 'REST', 'LEGS', 'GPUSH', 'REST', 'REST'],
    5: ['PUSH', 'PULL', 'LEGS', 'C', 'PUSH', 'PULL', 'REST'],
    6: ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL', 'LEGS', 'REST'],
  },
  UPPER_LOWER: {
    3: ['UPPER', 'LOWER', 'REST', 'UPPER', 'REST', 'X', 'REST'],
    4: ['UPPER', 'LOWER', 'REST', 'UPPER', 'LOWER', 'X', 'REST'],
    5: ['UPPER', 'LOWER', 'C', 'UPPER', 'LOWER', 'GFULL', 'REST'],
    6: ['UPPER', 'LOWER', 'GFULL', 'UPPER', 'LOWER', 'GFULL', 'REST'],
  },
  FULL_BODY: {
    3: ['FULL', 'REST', 'FULL', 'REST', 'FULL', 'X', 'REST'],
    4: ['FULL', 'C', 'FULL', 'REST', 'FULL', 'GFULL', 'REST'],
    5: ['FULL', 'CARDIO', 'FULL', 'RECOVERY', 'FULL', 'GFULL', 'REST'],
    6: ['FULL', 'CARDIO', 'FULL', 'CARDIO', 'FULL', 'GFULL', 'REST'],
  },
};

const SPLIT_LABEL: Record<WorkoutSplitStyle, string> = {
  PUSH_PULL_LEGS: 'Push/Pull/Legs',
  UPPER_LOWER: 'Upper/Lower',
  FULL_BODY: 'Full Body',
};
const SPLIT_SLUG: Record<WorkoutSplitStyle, string> = { PUSH_PULL_LEGS: 'PPL', UPPER_LOWER: 'UL', FULL_BODY: 'FB' };

const KIND_FOCUS: Record<StrengthKind, string> = {
  PUSH: 'Push Day',
  PULL: 'Pull Day',
  LEGS: 'Leg Day',
  UPPER: 'Upper Body',
  LOWER: 'Lower Body',
  FULL: 'Full Body Strength',
};
const KIND_NAME: Record<StrengthKind, string> = {
  PUSH: 'Chest, Shoulders & Triceps',
  PULL: 'Back & Biceps',
  LEGS: 'Quads, Hamstrings & Glutes',
  UPPER: 'Upper Body Strength',
  LOWER: 'Lower Body Strength',
  FULL: 'Total Body Strength',
};
const KIND_WARMUP: Record<DayKind, string | null> = {
  PUSH: '5 min easy cardio, arm circles, band pull-aparts, then a light set of your first press.',
  PULL: '5 min easy cardio, cat-cow, scapular pull-ups or band pull-aparts, then a light first set.',
  LEGS: '5 min easy cardio, bodyweight squats, hip circles and glute bridges.',
  UPPER: '5 min easy cardio, shoulder circles, thoracic rotations and a light first set.',
  LOWER: '5 min easy cardio, leg swings, bodyweight squats and glute bridges.',
  FULL: '5 min easy cardio, a few rounds of squat-to-reach, arm circles and hip hinges.',
  CARDIO: '3-5 min of easy movement to raise your heart rate gradually.',
  RECOVERY: null,
  REST: null,
};

const GOAL_SLUG: Record<FitnessGoal, string> = { WEIGHT_LOSS: 'LOSS', MUSCLE_GAIN: 'GAIN', MAINTAIN_WEIGHT: 'MAINT' };
const GOAL_LABEL: Record<FitnessGoal, string> = {
  WEIGHT_LOSS: 'Fat Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintenance',
};

const REPS_GYM: Record<FitnessGoal, { compound: Record<1 | 2 | 3, string>; accessory: string }> = {
  MUSCLE_GAIN: { compound: { 1: '10-12', 2: '8-10', 3: '6-8' }, accessory: '10-12' },
  WEIGHT_LOSS: { compound: { 1: '12-15', 2: '12-15', 3: '12-15' }, accessory: '15-20' },
  MAINTAIN_WEIGHT: { compound: { 1: '10-12', 2: '8-12', 3: '8-12' }, accessory: '12-15' },
};
const REPS_HOME: Record<FitnessGoal, { compound: string; accessory: string }> = {
  MUSCLE_GAIN: { compound: '10-15', accessory: '15-20' },
  WEIGHT_LOSS: { compound: '15-20', accessory: '15-20' },
  MAINTAIN_WEIGHT: { compound: '12-15', accessory: '15-20' },
};
const REST_COMPOUND: Record<FitnessGoal, Record<1 | 2 | 3, number>> = {
  MUSCLE_GAIN: { 1: 75, 2: 90, 3: 120 },
  WEIGHT_LOSS: { 1: 45, 2: 40, 3: 40 },
  MAINTAIN_WEIGHT: { 1: 60, 2: 60, 3: 75 },
};

interface BuildCtx {
  split: WorkoutSplitStyle;
  spec: TemplateSpec;
  goal: FitnessGoal;
  level: 1 | 2 | 3;
  home: boolean;
  /** Rotates which exercises are picked so no two templates read the same. */
  variant: number;
}

function resolveToken(token: Token, goal: FitnessGoal): DayKind {
  const filler: DayKind = goal === 'WEIGHT_LOSS' ? 'CARDIO' : goal === 'MAINTAIN_WEIGHT' ? 'RECOVERY' : 'REST';
  switch (token) {
    case 'X':
      return filler;
    case 'C':
      return goal === 'WEIGHT_LOSS' ? 'CARDIO' : 'REST';
    case 'GPUSH':
      return goal === 'MUSCLE_GAIN' ? 'PUSH' : filler;
    case 'GFULL':
      return goal === 'MUSCLE_GAIN' ? 'FULL' : filler;
    default:
      return token;
  }
}

function poolFor(key: PoolKey, ctx: BuildCtx): PoolExercise[] {
  const list = EXERCISE_POOLS[key].filter((x) => {
    if (x.d > ctx.level) return false;
    if (ctx.spec.lowImpact && x.hi) return false;
    return ctx.home ? x.e !== 'G' : x.e !== 'H';
  });
  // Advanced lifters start from the hardest options; everyone else from the easiest.
  return ctx.level === 3 ? [...list].sort((p, q) => q.d - p.d) : list;
}

function pick(list: PoolExercise[], start: number, used: Set<string>): PoolExercise | undefined {
  for (let i = 0; i < list.length; i++) {
    const candidate = list[(start + i) % list.length];
    if (!used.has(candidate.name)) {
      used.add(candidate.name);
      return candidate;
    }
  }
  return undefined;
}

function buildStrengthExercise(entry: PoolExercise, key: PoolKey, ctx: BuildCtx) {
  const compound = COMPOUND_POOLS.includes(key);
  const lvl = ctx.level;
  let sets: number;
  let reps: string;
  let restSeconds: number;

  if (entry.r) {
    sets = lvl === 1 ? 2 : 3;
    reps = entry.r;
    restSeconds = 30;
  } else {
    sets = compound ? { 1: 2, 2: 3, 3: 4 }[lvl] : { 1: 2, 2: 3, 3: 3 }[lvl];
    if (compound && lvl === 3 && ctx.goal === 'MUSCLE_GAIN' && !ctx.home) sets = 5;
    const gym = REPS_GYM[ctx.goal];
    const home = REPS_HOME[ctx.goal];
    reps = ctx.home ? (compound ? home.compound : home.accessory) : compound ? gym.compound[lvl] : gym.accessory;
    restSeconds = compound ? REST_COMPOUND[ctx.goal][lvl] : Math.max(30, REST_COMPOUND[ctx.goal][lvl] - 20);
  }

  return {
    name: entry.name,
    sets,
    reps,
    restSeconds,
    tempo: ctx.goal === 'MUSCLE_GAIN' && compound && lvl >= 2 ? '3-1-1-0' : null,
    targetMuscles: entry.m,
    difficulty: (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const)[entry.d - 1],
    estimatedCalories: sets * (compound ? 10 : 6),
    equipment: entry.eq,
    notes: lvl === 1 && compound ? 'Pick a weight or variation you can control for every rep.' : null,
  };
}

function buildTips(kind: DayKind, ctx: BuildCtx): string[] {
  if (kind === 'REST') {
    return ['Rest is when you adapt — sleep 7-9 hours and stay hydrated.', 'A relaxed walk is fine if you feel restless.'];
  }
  const goalTip: Record<FitnessGoal, string> = {
    WEIGHT_LOSS: 'Keep rests short and move with purpose; your heart rate staying up is the point.',
    MUSCLE_GAIN: 'Control the lowering phase and aim to beat last week by a rep or a little more weight.',
    MAINTAIN_WEIGHT: 'Finish each set with 1-2 reps in reserve so training stays sustainable.',
  };
  const levelTip: Record<1 | 2 | 3, string> = {
    1: 'Focus on form before load, and stop a set if your form breaks down.',
    2: 'Add a rep or a small amount of weight once every set feels solid.',
    3: 'Work top sets around RPE 8-9 and log your numbers to keep progressing.',
  };
  const tips = [goalTip[ctx.goal], levelTip[ctx.level]];
  if (ctx.spec.lowImpact) tips.push('Everything here is low impact — skip any move that bothers your joints.');
  return tips;
}

function buildProgression(kind: DayKind, ctx: BuildCtx): string | null {
  if (kind === 'REST') return null;
  if (kind === 'CARDIO') return 'Add 2-3 minutes to each block next week, or nudge the pace up slightly.';
  if (kind === 'RECOVERY') return 'Hold each stretch a little longer as your range of motion improves.';
  if (ctx.goal === 'MUSCLE_GAIN') return 'When you hit the top of the rep range on every set, increase the load by the smallest step available.';
  if (ctx.goal === 'WEIGHT_LOSS') return 'Shave 5-10 seconds off your rests or add a few reps before adding load.';
  return 'Repeat these numbers for two weeks, then add a rep to each set.';
}

function roundTo5(minutes: number): number {
  return Math.max(5, Math.round(minutes / 5) * 5);
}

function buildDay(kind: DayKind, dayIndex: number, occurrence: number, ctx: BuildCtx): EnrichedWorkoutDay {
  const day = DAY_NAMES[dayIndex];
  const tips = buildTips(kind, ctx);
  const progressionAdvice = buildProgression(kind, ctx);

  if (kind === 'REST') {
    return { day, focus: 'Rest', workoutName: 'Rest & Recover', warmUp: null, coolDown: null, estimatedDurationMinutes: null, estimatedCaloriesBurned: null, coachingTips: tips, progressionAdvice, exercises: [] };
  }

  const used = new Set<string>();
  const start = ctx.variant + occurrence * 3;

  if (kind === 'CARDIO') {
    const count = ctx.goal === 'WEIGHT_LOSS' ? 3 : 2;
    const minutes = { 1: 10, 2: 12, 3: 15 }[ctx.level];
    const cardio = poolFor('cardio', ctx);
    const exercises = Array.from({ length: count }, (_, i) => pick(cardio, start + i, used))
      .filter((x): x is PoolExercise => x !== undefined)
      .map((entry) => ({
        name: entry.name,
        sets: 1,
        reps: (entry.r ?? '{t} min').replace('{t}', String(minutes)),
        restSeconds: 0,
        tempo: null,
        targetMuscles: entry.m,
        difficulty: (['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const)[entry.d - 1],
        estimatedCalories: minutes * 9,
        equipment: entry.eq,
        notes: null,
      }));
    const total = exercises.length * minutes + 5;
    return {
      day,
      focus: ctx.goal === 'WEIGHT_LOSS' ? 'Cardio Intervals' : 'Light Cardio',
      workoutName: 'Conditioning',
      warmUp: KIND_WARMUP.CARDIO,
      coolDown: '3-5 min easy walking, then gentle calf and hamstring stretches.',
      estimatedDurationMinutes: roundTo5(total),
      estimatedCaloriesBurned: Math.round(total * 8),
      coachingTips: tips,
      progressionAdvice,
      exercises,
    };
  }

  if (kind === 'RECOVERY') {
    const mobility = poolFor('mobility', ctx);
    const core = poolFor('core', ctx).filter((x) => x.d === 1);
    const picks = [
      ...Array.from({ length: 4 }, (_, i) => pick(mobility, start + i, used)),
      ...Array.from({ length: 2 }, (_, i) => pick(core, start + i, used)),
    ];
    const exercises = picks
      .filter((entry): entry is PoolExercise => entry !== undefined)
      .map((entry) => ({
        name: entry.name,
        sets: 2,
        reps: entry.r ?? '10',
        restSeconds: 20,
        tempo: null,
        targetMuscles: entry.m,
        difficulty: 'BEGINNER' as const,
        estimatedCalories: 15,
        equipment: entry.eq,
        notes: null,
      }));
    return {
      day,
      focus: 'Mobility + Core',
      workoutName: 'Active Recovery',
      warmUp: '2 min of easy marching or walking to loosen up.',
      coolDown: '2 min of slow nasal breathing, lying on your back.',
      estimatedDurationMinutes: 25,
      estimatedCaloriesBurned: 80,
      coachingTips: ['Move slowly and never push into pain.', ...tips.slice(0, 1)],
      progressionAdvice,
      exercises,
    };
  }

  // Strength days
  const count = { 1: 4, 2: 5, 3: 6 }[ctx.level];
  const slotUses = new Map<PoolKey, number>();
  const exercises = SLOTS[kind]
    .slice(0, count)
    .map((key, slotIndex) => {
      const nth = slotUses.get(key) ?? 0;
      slotUses.set(key, nth + 1);
      const entry = pick(poolFor(key, ctx), start + nth + slotIndex, used);
      return entry ? buildStrengthExercise(entry, key, ctx) : undefined;
    })
    .filter((x): x is NonNullable<typeof x> => x !== undefined);

  const workMinutes = exercises.reduce((sum, e) => sum + (e.sets * (45 + e.restSeconds)) / 60, 0);
  const duration = roundTo5(workMinutes + 8);
  const kcalPerMin = ctx.goal === 'WEIGHT_LOSS' ? 7 : 6;
  const suffix = ctx.home ? ' (Bodyweight)' : '';

  return {
    day,
    focus: `${KIND_FOCUS[kind]}${suffix}`,
    workoutName: KIND_NAME[kind],
    warmUp: KIND_WARMUP[kind],
    coolDown: '5 min easy walk, then stretch the muscles you trained for 30-45 seconds each.',
    estimatedDurationMinutes: duration,
    estimatedCaloriesBurned: Math.round(duration * kcalPerMin),
    coachingTips: tips,
    progressionAdvice,
    exercises,
  };
}

export function buildTemplate(split: WorkoutSplitStyle, spec: TemplateSpec, specIndex: number, splitIndex: number): BackupTemplate {
  const goal = spec.goals[0];
  const ctx: BuildCtx = {
    split,
    spec,
    goal,
    level: LEVEL_NUM[spec.buildLevel],
    home: spec.equipment === 'HOME',
    variant: specIndex * 2 + splitIndex,
  };

  const kinds = LAYOUTS[split][spec.trainDays].map((t) => resolveToken(t, goal));
  const seen = new Map<DayKind, number>();
  const days = kinds.map((kind, i) => {
    const occurrence = seen.get(kind) ?? 0;
    seen.set(kind, occurrence + 1);
    return buildDay(kind, i, occurrence, ctx);
  });

  return {
    id: `${SPLIT_SLUG[split]}-${spec.slug}`,
    name: `${SPLIT_LABEL[split]} - ${spec.name}`,
    splitStyle: split,
    goals: spec.goals,
    levels: spec.levels,
    equipment: spec.equipment,
    daysPerWeek: kinds.filter((k) => k !== 'REST').length,
    tags: spec.lowImpact ? ['LOW_IMPACT'] : [],
    days,
  };
}

export { GOAL_SLUG, GOAL_LABEL };
