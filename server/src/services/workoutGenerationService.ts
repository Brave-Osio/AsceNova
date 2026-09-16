import { z } from 'zod';
import { Type } from '@google/genai';
import type { Profile } from '@prisma/client';
import { generateStructuredContent } from '../lib/gemini.js';
import type { GeneratedWorkoutDay } from './planService.js';

export const WORKOUT_PROMPT_VERSION = 'workout-gemini-v1';

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1).max(10),
  reps: z.string().min(1),
  restSeconds: z.number().int().min(0).max(600),
  tempo: z.string().nullable().optional(),
  targetMuscles: z.array(z.string()),
  difficulty: z.enum(DIFFICULTIES),
  estimatedCalories: z.number().int().nullable().optional(),
  equipment: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const dayDetailSchema = z.object({
  workoutName: z.string().nullable().optional(),
  warmUp: z.string().nullable().optional(),
  coolDown: z.string().nullable().optional(),
  estimatedDurationMinutes: z.number().int().nullable().optional(),
  estimatedCaloriesBurned: z.number().int().nullable().optional(),
  coachingTips: z.array(z.string()),
  progressionAdvice: z.string().nullable().optional(),
  exercises: z.array(exerciseSchema),
});

/** Validated in addition to the Gemini responseSchema below — never trust raw LLM JSON. */
export const workoutDetailResponseSchema = z.object({
  days: z.array(dayDetailSchema).length(7),
});

export type WorkoutDetailResponse = z.infer<typeof workoutDetailResponseSchema>;
export type DayDetail = z.infer<typeof dayDetailSchema>;

export interface EnrichedWorkoutDay extends GeneratedWorkoutDay, DayDetail {}

const exerciseResponseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    sets: { type: Type.INTEGER },
    reps: { type: Type.STRING, description: 'e.g. "8-10", "12", or "Failure"' },
    restSeconds: { type: Type.INTEGER },
    tempo: { type: Type.STRING, nullable: true },
    targetMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
    difficulty: { type: Type.STRING, enum: DIFFICULTIES as unknown as string[] },
    estimatedCalories: { type: Type.INTEGER, nullable: true },
    equipment: { type: Type.STRING, nullable: true },
    notes: { type: Type.STRING, nullable: true },
  },
  required: ['name', 'sets', 'reps', 'restSeconds', 'targetMuscles', 'difficulty'],
};

const dayResponseSchema = {
  type: Type.OBJECT,
  properties: {
    workoutName: { type: Type.STRING, nullable: true },
    warmUp: { type: Type.STRING, nullable: true },
    coolDown: { type: Type.STRING, nullable: true },
    estimatedDurationMinutes: { type: Type.INTEGER, nullable: true },
    estimatedCaloriesBurned: { type: Type.INTEGER, nullable: true },
    coachingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    progressionAdvice: { type: Type.STRING, nullable: true },
    exercises: { type: Type.ARRAY, items: exerciseResponseSchema },
  },
  required: ['coachingTips', 'exercises'],
};

const workoutDetailGeminiSchema = {
  type: Type.OBJECT,
  properties: {
    days: { type: Type.ARRAY, items: dayResponseSchema },
  },
  required: ['days'],
};

function formatSkeleton(skeleton: GeneratedWorkoutDay[]): string {
  return skeleton.map((d, i) => `${i + 1}. ${d.day}: ${d.focus}`).join('\n');
}

function buildPrompt(profile: Profile, skeleton: GeneratedWorkoutDay[], priorExerciseNames: string[]): string {
  const lines = [
    'You are a certified strength & conditioning coach designing a detailed workout plan for one specific client.',
    'A 7-day day/focus schedule has already been decided — do NOT change the days or their focus. Your job is only',
    'to fill in real, exercise-level detail for each of those 7 days, in the exact same order.',
    '',
    'CLIENT PROFILE',
    `- Age: ${profile.age}, Gender: ${profile.gender ?? 'unspecified'}`,
    `- Height: ${profile.heightCm}cm, Weight: ${profile.currentWeightKg}kg`,
    `- Goal: ${profile.goal}, Fitness level: ${profile.fitnessLevel}`,
    `- Equipment access: ${profile.equipmentAccess} (HOME = bodyweight/bands only, GYM/BOTH = full gym equipment allowed)`,
    '',
    'FIXED 7-DAY SCHEDULE (return exactly 7 "days" entries, in this order, matching these days/foci)',
    formatSkeleton(skeleton),
    '',
    'For each day: provide a short workoutName, a brief warmUp (unless it is a Rest day), 4-7 exercises for training',
    'days (0 exercises for Rest/Cardio-only days is fine — cardio days can have 1-3 conditioning "exercises" instead),',
    'each with sets, reps (a range like "8-10" is fine), restSeconds, targetMuscles, and a difficulty appropriate to',
    "the client's fitness level. Add a coolDown, 1-3 coachingTips, and one progressionAdvice sentence per day.",
    'Only prescribe equipment consistent with the client\'s equipment access.',
  ];

  if (priorExerciseNames.length > 0) {
    lines.push(
      '',
      "To keep this plan feeling fresh, avoid just repeating most of the client's previous plan's exercises:",
      priorExerciseNames.join(', '),
    );
  }

  return lines.join('\n');
}

/**
 * Fills in exercise-level detail for a fixed 7-day skeleton via Gemini,
 * validates the response, and zips it back onto the skeleton by index.
 * Throws on any failure (missing key, request error, malformed response)
 * — callers (planService) decide whether/how to fall back.
 */
export async function generateExerciseDetail(
  profile: Profile,
  skeleton: GeneratedWorkoutDay[],
  priorExerciseNames: string[],
): Promise<EnrichedWorkoutDay[]> {
  const prompt = buildPrompt(profile, skeleton, priorExerciseNames);
  const raw = await generateStructuredContent<unknown>(prompt, workoutDetailGeminiSchema);
  const parsed = workoutDetailResponseSchema.parse(raw);

  return skeleton.map((day, i) => ({ ...day, ...parsed.days[i] }));
}
