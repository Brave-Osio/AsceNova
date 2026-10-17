import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import { REST_FOCUS } from './workoutGenerationService.js';
import * as progressService from './progressService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Completions may be recorded for the last week (backfill) and up to tomorrow UTC (users ahead of UTC). */
const MAX_BACKFILL_DAYS = 7;

/** `YYYY-MM-DD` -> that day at UTC midnight (how every `@db.Date` column in this app is stored). */
export function parseDateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, 'Invalid date');
  }
  return date;
}

/**
 * The calendar date comes from the client's local clock (the app has no per-user timezone), so the
 * server only enforces a sane window around its own UTC date: every real timezone (UTC-12..UTC+14)
 * is within one day of UTC.
 */
export function assertDateInWindow(date: Date, now: Date = new Date()): void {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.round((date.getTime() - todayUtc) / DAY_MS);
  if (diffDays > 1 || diffDays < -MAX_BACKFILL_DAYS) {
    throw new HttpError(400, 'Date is outside the allowed range');
  }
}

/** Plan days are stored Monday..Sunday as dayIndex 0..6. */
export function weekdayIndexForDate(date: Date): number {
  return (date.getUTCDay() + 6) % 7;
}

function isRestDay(day: { focus: string; exercises: unknown[] }): boolean {
  return day.focus === REST_FOCUS || day.exercises.length === 0;
}

/** Read-only: what the user's existing active plan schedules for this date, and whether it's done. Never generates a plan. */
export async function getWorkoutForDate(userId: string, dateString: string) {
  const date = parseDateOnly(dateString);

  const plan = await prisma.workoutPlan.findFirst({
    where: { userId, isActive: true },
    select: {
      id: true,
      workoutDays: {
        where: { dayIndex: weekdayIndexForDate(date) },
        include: { exercises: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!plan) {
    return { date: dateString, hasPlan: false as const, workout: null, isRestDay: false, completed: false, completedAt: null };
  }

  const day = plan.workoutDays[0];
  if (!day || isRestDay(day)) {
    return { date: dateString, hasPlan: true as const, workout: null, isRestDay: true, completed: false, completedAt: null };
  }

  const log = await prisma.workoutLog.findFirst({
    where: { userId, workoutDayId: day.id, date },
    select: { createdAt: true },
  });

  return {
    date: dateString,
    hasPlan: true as const,
    workout: {
      id: day.id,
      dayLabel: day.label,
      focus: day.focus,
      name: day.workoutName,
      warmUp: day.warmUp,
      coolDown: day.coolDown,
      estimatedDurationMinutes: day.estimatedDurationMinutes,
      estimatedCaloriesBurned: day.estimatedCaloriesBurned,
      coachingTips: day.coachingTips,
      exercises: day.exercises.map((e) => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds,
        tempo: e.tempo,
        equipment: e.equipment,
        notes: e.notes,
      })),
    },
    isRestDay: false,
    completed: log !== null,
    completedAt: log ? log.createdAt.toISOString() : null,
  };
}

/**
 * Marks the scheduled workout done for a date. Idempotent and safe under concurrent submits:
 *  - ownership: the day must belong to the caller's ACTIVE plan (never trust a client-sent id);
 *  - schedule: the date's weekday must match the day's slot, and it can't be a rest day;
 *  - exactly-once: the unique (userId, workoutDayId, date) index + createMany(skipDuplicates) lets only
 *    one request create the log; the rest see `alreadyCompleted`;
 *  - rewards: progressService.applyDailyLog applies the app's existing streak/XP/achievement rules and
 *    de-duplicates per-day XP, so re-running it (retry after a partial failure) never double-pays.
 */
export async function completeWorkout(userId: string, workoutDayId: string, dateString: string) {
  const date = parseDateOnly(dateString);
  assertDateInWindow(date);

  const day = await prisma.workoutDay.findFirst({
    where: { id: workoutDayId, workoutPlan: { userId, isActive: true } },
    include: { exercises: { select: { id: true } } },
  });
  if (!day) {
    throw new HttpError(404, 'Workout not found');
  }
  if (day.dayIndex !== weekdayIndexForDate(date) || isRestDay(day)) {
    throw new HttpError(400, 'That workout is not scheduled for this date');
  }

  const profile = await prisma.profile.findUnique({ where: { userId }, select: { currentWeightKg: true } });
  const latestLog = await prisma.dailyProgress.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { weightKg: true },
  });
  const weightKg = latestLog?.weightKg ?? profile?.currentWeightKg;
  if (weightKg == null) {
    throw new HttpError(400, 'Set up your profile before logging workouts');
  }

  const alreadyCompleted = await prisma.$transaction(async (tx) => {
    const created = await tx.workoutLog.createMany({
      data: [
        {
          userId,
          workoutDayId,
          date,
          durationMinutes: day.estimatedDurationMinutes,
          caloriesBurned: day.estimatedCaloriesBurned,
        },
      ],
      skipDuplicates: true,
    });

    await tx.dailyProgress.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, weightKg, workoutCompleted: true },
      update: { workoutCompleted: true },
    });

    return created.count === 0;
  });

  const result = await progressService.applyDailyLog(userId, date);
  return { completed: true, alreadyCompleted, ...result };
}
