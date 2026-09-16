import { prisma } from '../lib/prismaClient.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as dailyProgressService from './dailyProgressService.js';
import * as notificationService from './notificationService.js';
import type { RankName, XpSource } from '@prisma/client';

/** Ported from src/constants/xpRules.ts XP_REWARDS (achievementUnlock only — the
 * sevenDayStreak/thirtyDayStreak amounts exist there but were never actually used
 * by the real (non-Simulate) submission path, only by the old Simulate engine —
 * not carried over, to match what real submissions have always actually granted. */
const XP_REWARDS = {
  DAILY_CHECK_IN: 10,
  WORKOUT_COMPLETED: 50,
  HIT_WATER_GOAL: 10,
  HIT_PROTEIN_GOAL: 10,
  SLEPT_7_PLUS_HOURS: 10,
  REACHED_STEP_GOAL: 10,
  ACHIEVEMENT_UNLOCK: 100,
} as const;

/** Ported from src/constants/ranks.ts RANK_THRESHOLDS. */
const RANK_THRESHOLDS: { name: RankName; minXp: number }[] = [
  { name: 'IRON', minXp: 0 },
  { name: 'BRONZE', minXp: 500 },
  { name: 'SILVER', minXp: 1500 },
  { name: 'GOLD', minXp: 3000 },
  { name: 'PLATINUM', minXp: 5000 },
  { name: 'DIAMOND', minXp: 8000 },
  { name: 'ASCENDANT', minXp: 12000 },
  { name: 'IMMORTAL', minXp: 18000 },
  { name: 'RADIANT', minXp: 25000 },
];

/** Ported from src/engines/rankEngine.ts getRankForXp. */
export function getRankForXp(totalXp: number): RankName {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= RANK_THRESHOLDS[i].minXp) return RANK_THRESHOLDS[i].name;
  }
  return RANK_THRESHOLDS[0].name;
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const fromUtc = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const toUtc = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((toUtc - fromUtc) / msPerDay);
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/** Ported from src/engines/streakEngine.ts calculateStreak. */
export function calculateStreak(
  currentStreak: number,
  longestStreak: number,
  lastLogDate: Date | null,
  newLogDate: Date,
): StreakResult {
  if (lastLogDate === null) {
    return { currentStreak: 1, longestStreak: Math.max(1, longestStreak) };
  }

  const gap = daysBetween(lastLogDate, newLogDate);

  if (gap === 0) {
    return { currentStreak, longestStreak };
  }

  if (gap === 1) {
    const next = currentStreak + 1;
    return { currentStreak: next, longestStreak: Math.max(next, longestStreak) };
  }

  // gap > 1 (or negative) — broken streak, restart at 1.
  return { currentStreak: 1, longestStreak: Math.max(1, longestStreak) };
}

interface AchievementContext {
  currentStreak: number;
  totalXp: number;
  logCount: number;
  hasWorkoutLog: boolean;
}

/** Ported from src/engines/achievementEngine.ts ACHIEVEMENT_RULES, DB-dependent
 * rules (first_workout, first_week_completed, consistency_master) now backed
 * by real DailyProgress queries instead of a local log array. */
const ACHIEVEMENT_RULES: Record<string, (ctx: AchievementContext) => boolean> = {
  first_workout: (ctx) => ctx.hasWorkoutLog,
  first_week_completed: (ctx) => ctx.logCount >= 7,
  seven_day_streak: (ctx) => ctx.currentStreak >= 7,
  thirty_day_streak: (ctx) => ctx.currentStreak >= 30,
  bronze_promotion: (ctx) => getRankForXp(ctx.totalXp) !== 'IRON',
  silver_promotion: (ctx) =>
    (['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ASCENDANT', 'IMMORTAL', 'RADIANT'] as RankName[]).includes(
      getRankForXp(ctx.totalXp),
    ),
  gold_promotion: (ctx) =>
    (['GOLD', 'PLATINUM', 'DIAMOND', 'ASCENDANT', 'IMMORTAL', 'RADIANT'] as RankName[]).includes(
      getRankForXp(ctx.totalXp),
    ),
  consistency_master: (ctx) => ctx.logCount >= 50,
  discipline_champion: (ctx) => ctx.currentStreak >= 100,
};

export function evaluateAchievements(ctx: AchievementContext, alreadyUnlockedIds: string[]): string[] {
  const newlyUnlocked: string[] = [];
  for (const [id, rule] of Object.entries(ACHIEVEMENT_RULES)) {
    if (!alreadyUnlockedIds.includes(id) && rule(ctx)) {
      newlyUnlocked.push(id);
    }
  }
  return newlyUnlocked;
}

async function getUnlockedAchievementIds(userId: string): Promise<string[]> {
  const rows = await prisma.achievementProgress.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  return rows.map((r) => r.achievementId);
}

export async function getProgress(userId: string) {
  const progress = await prisma.userProgress.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const unlockedAchievementIds = await getUnlockedAchievementIds(userId);

  return {
    totalXp: progress.totalXp,
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    lastLogDate: progress.lastLogDate,
    unlockedAchievementIds,
  };
}

/**
 * Applies the gamification effects of a daily log that's already been
 * saved (via dailyProgressService.upsertLog) — streak, XP (check-in +
 * per completed habit + per newly-unlocked achievement), and achievement
 * unlocks — all in one transaction. Requires the DailyProgress row for
 * this date to already exist.
 */
export async function applyDailyLog(userId: string, date: Date) {
  const dailyLog = await prisma.dailyProgress.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!dailyLog) {
    throw new HttpError(404, 'No daily progress entry for that date yet');
  }

  return prisma.$transaction(async (tx) => {
    const current = await tx.userProgress.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    const existingAchievementIds = (
      await tx.achievementProgress.findMany({ where: { userId }, select: { achievementId: true } })
    ).map((a) => a.achievementId);

    const streak = calculateStreak(current.currentStreak, current.longestStreak, current.lastLogDate, date);

    const xpGrants: { amount: number; reason: XpSource; sourceRefId?: string }[] = [
      { amount: XP_REWARDS.DAILY_CHECK_IN, reason: 'DAILY_CHECK_IN' },
    ];
    if (dailyLog.workoutCompleted) xpGrants.push({ amount: XP_REWARDS.WORKOUT_COMPLETED, reason: 'WORKOUT_COMPLETED' });
    if (dailyLog.hitWaterGoal) xpGrants.push({ amount: XP_REWARDS.HIT_WATER_GOAL, reason: 'HIT_WATER_GOAL' });
    if (dailyLog.hitProteinGoal) xpGrants.push({ amount: XP_REWARDS.HIT_PROTEIN_GOAL, reason: 'HIT_PROTEIN_GOAL' });
    if (dailyLog.slept7PlusHours) xpGrants.push({ amount: XP_REWARDS.SLEPT_7_PLUS_HOURS, reason: 'SLEPT_7_PLUS_HOURS' });
    if (dailyLog.reachedStepGoal) xpGrants.push({ amount: XP_REWARDS.REACHED_STEP_GOAL, reason: 'REACHED_STEP_GOAL' });

    const totalXpBeforeAchievements = current.totalXp + xpGrants.reduce((sum, g) => sum + g.amount, 0);

    const [logCount, hasWorkoutLog] = await Promise.all([
      dailyProgressService.countLogs(userId),
      dailyProgressService.hasWorkoutCompletedLog(userId),
    ]);

    const newlyUnlockedIds = evaluateAchievements(
      { currentStreak: streak.currentStreak, totalXp: totalXpBeforeAchievements, logCount, hasWorkoutLog },
      existingAchievementIds,
    );

    for (const id of newlyUnlockedIds) {
      xpGrants.push({ amount: XP_REWARDS.ACHIEVEMENT_UNLOCK, reason: 'ACHIEVEMENT_UNLOCK', sourceRefId: id });
    }

    const totalXp = current.totalXp + xpGrants.reduce((sum, g) => sum + g.amount, 0);
    const newRank = getRankForXp(totalXp);
    const rankChanged = newRank !== current.cachedRank;

    await tx.userProgress.update({
      where: { userId },
      data: {
        totalXp,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastLogDate: date,
        cachedRank: newRank,
      },
    });

    await tx.xpHistory.createMany({
      data: xpGrants.map((g) => ({ userId, amount: g.amount, reason: g.reason, sourceRefId: g.sourceRefId })),
    });

    if (rankChanged) {
      await tx.rankHistory.create({ data: { userId, rank: newRank, totalXpAtChange: totalXp } });
      await notificationService.createNotification(tx, {
        userId,
        type: 'RANK_UP',
        title: 'Rank Up!',
        body: `You've reached ${newRank} rank — keep up the momentum!`,
      });
    }

    if (newlyUnlockedIds.length > 0) {
      await tx.achievementProgress.createMany({
        data: newlyUnlockedIds.map((id) => ({ userId, achievementId: id })),
        skipDuplicates: true,
      });
    }

    const unlockedAchievements = await tx.achievement.findMany({ where: { id: { in: newlyUnlockedIds } } });
    const newAchievementTitles = newlyUnlockedIds.map(
      (id) => unlockedAchievements.find((a) => a.id === id)?.title ?? id,
    );

    if (unlockedAchievements.length > 0) {
      await tx.notification.createMany({
        data: unlockedAchievements.map((a) => ({
          userId,
          type: 'ACHIEVEMENT' as const,
          title: 'Achievement Unlocked!',
          body: `You unlocked "${a.title}"!`,
          metadata: { achievementId: a.id },
        })),
      });
    }
    const xpGained = xpGrants.reduce((sum, g) => sum + g.amount, 0);

    return {
      progress: {
        totalXp,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastLogDate: date,
        unlockedAchievementIds: [...existingAchievementIds, ...newlyUnlockedIds],
      },
      xpGained,
      newAchievementTitles,
    };
  });
}
