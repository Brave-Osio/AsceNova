import { prisma } from '../lib/prismaClient.js';

export interface CoachContext {
  profile: {
    fullName: string;
    age: number;
    gender: string | null;
    heightCm: number;
    currentWeightKg: number;
    goalWeightKg: number | null;
    goal: string;
    fitnessLevel: string;
    equipmentAccess: string;
    activityLevel: string | null;
    foodPreference: string | null;
    foodAllergies: string[];
    medicalRestrictions: string[];
  } | null;
  activePlan: {
    splitStyle: string;
    workoutDays: { label: string; focus: string }[];
    nutrition: {
      calories: number;
      proteinGrams: number;
      carbsGrams: number;
      fatGrams: number;
      waterLiters: number;
    } | null;
  } | null;
  progress: {
    totalXp: number;
    rank: string;
    currentStreak: number;
    longestStreak: number;
  } | null;
  recentDailyProgress: {
    date: string;
    workoutCompleted: boolean;
    hitWaterGoal: boolean;
    hitProteinGoal: boolean;
    slept7PlusHours: boolean;
    reachedStepGoal: boolean;
    weightKg: number;
  }[];
  todayWaterMl: number;
  unlockedAchievementTitles: string[];
  activeGoals: { goalType: string; targetValue: number | null; targetDate: string | null }[];
}

/**
 * Gathers everything the AI coach needs to answer personally: profile,
 * active workout/nutrition plan, recent habit log, today's water intake,
 * gamification state, and active goals. Returned as a plain structured
 * object (not raw Prisma rows) — the caller both formats this into the
 * Gemini prompt and stores it verbatim as ChatMessage.contextSnapshot.
 */
export async function getUserContext(userId: string): Promise<CoachContext> {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [user, recentDailyProgress, todayWaterLogs, achievementProgress, activeGoals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        userProgress: true,
        workoutPlans: {
          where: { isActive: true },
          include: { workoutDays: { orderBy: { dayIndex: 'asc' } }, nutritionPlan: true },
          take: 1,
        },
      },
    }),
    prisma.dailyProgress.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
    }),
    prisma.waterLog.findMany({
      where: { userId, date: startOfToday },
    }),
    prisma.achievementProgress.findMany({
      where: { userId },
      include: { achievement: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: 'ACTIVE' },
    }),
  ]);

  const activePlan = user?.workoutPlans[0];
  const profile = user?.profile;

  return {
    profile: profile
      ? {
          fullName: profile.fullName,
          age: profile.age,
          gender: profile.gender,
          heightCm: profile.heightCm,
          currentWeightKg: profile.currentWeightKg,
          goalWeightKg: profile.goalWeightKg,
          goal: profile.goal,
          fitnessLevel: profile.fitnessLevel,
          equipmentAccess: profile.equipmentAccess,
          activityLevel: profile.activityLevel,
          foodPreference: profile.foodPreference,
          foodAllergies: profile.foodAllergies,
          medicalRestrictions: profile.medicalRestrictions,
        }
      : null,
    activePlan: activePlan
      ? {
          splitStyle: activePlan.splitStyle,
          workoutDays: activePlan.workoutDays.map((d) => ({ label: d.label, focus: d.focus })),
          nutrition: activePlan.nutritionPlan
            ? {
                calories: activePlan.nutritionPlan.calories,
                proteinGrams: activePlan.nutritionPlan.proteinGrams,
                carbsGrams: activePlan.nutritionPlan.carbsGrams,
                fatGrams: activePlan.nutritionPlan.fatGrams,
                waterLiters: activePlan.nutritionPlan.waterLiters,
              }
            : null,
        }
      : null,
    progress: user?.userProgress
      ? {
          totalXp: user.userProgress.totalXp,
          rank: user.userProgress.cachedRank,
          currentStreak: user.userProgress.currentStreak,
          longestStreak: user.userProgress.longestStreak,
        }
      : null,
    recentDailyProgress: recentDailyProgress.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      workoutCompleted: d.workoutCompleted,
      hitWaterGoal: d.hitWaterGoal,
      hitProteinGoal: d.hitProteinGoal,
      slept7PlusHours: d.slept7PlusHours,
      reachedStepGoal: d.reachedStepGoal,
      weightKg: d.weightKg,
    })),
    todayWaterMl: todayWaterLogs.reduce((sum, w) => sum + w.amountMl, 0),
    unlockedAchievementTitles: achievementProgress.map((a) => a.achievement.title),
    activeGoals: activeGoals.map((g) => ({
      goalType: g.goalType,
      targetValue: g.targetValue,
      targetDate: g.targetDate ? g.targetDate.toISOString().slice(0, 10) : null,
    })),
  };
}

/** Formats a CoachContext into compact, readable text for the Gemini system prompt. */
export function formatContextAsPromptText(context: CoachContext): string {
  const lines: string[] = [];

  if (context.profile) {
    const p = context.profile;
    lines.push('USER PROFILE');
    lines.push(`- Name: ${p.fullName}, Age: ${p.age}${p.gender ? `, Gender: ${p.gender}` : ''}`);
    lines.push(
      `- Height: ${p.heightCm}cm, Current weight: ${p.currentWeightKg}kg${
        p.goalWeightKg ? `, Goal weight: ${p.goalWeightKg}kg` : ''
      }`,
    );
    lines.push(`- Goal: ${p.goal}, Fitness level: ${p.fitnessLevel}, Equipment: ${p.equipmentAccess}`);
    if (p.activityLevel) lines.push(`- Activity level: ${p.activityLevel}`);
    if (p.foodPreference) lines.push(`- Food preference: ${p.foodPreference}`);
    if (p.foodAllergies.length) lines.push(`- Food allergies: ${p.foodAllergies.join(', ')}`);
    if (p.medicalRestrictions.length) lines.push(`- Medical restrictions: ${p.medicalRestrictions.join(', ')}`);
  } else {
    lines.push('USER PROFILE: not set up yet — encourage them to complete onboarding for personalized advice.');
  }

  lines.push('');
  if (context.activePlan) {
    lines.push('CURRENT WORKOUT PLAN');
    lines.push(`- Split style: ${context.activePlan.splitStyle}`);
    for (const day of context.activePlan.workoutDays) {
      lines.push(`  - ${day.label}: ${day.focus}`);
    }
    if (context.activePlan.nutrition) {
      const n = context.activePlan.nutrition;
      lines.push(
        `- Daily nutrition targets: ${n.calories} kcal, ${n.proteinGrams}g protein, ${n.carbsGrams}g carbs, ${n.fatGrams}g fat, ${n.waterLiters}L water`,
      );
    }
  } else {
    lines.push('CURRENT WORKOUT PLAN: none generated yet.');
  }

  if (context.progress) {
    lines.push('');
    lines.push('GAMIFICATION STATE');
    lines.push(`- Rank: ${context.progress.rank}, Total XP: ${context.progress.totalXp}`);
    lines.push(
      `- Current streak: ${context.progress.currentStreak} days, Longest streak: ${context.progress.longestStreak} days`,
    );
    if (context.unlockedAchievementTitles.length) {
      lines.push(`- Unlocked achievements: ${context.unlockedAchievementTitles.join(', ')}`);
    }
  }

  if (context.recentDailyProgress.length) {
    lines.push('');
    lines.push('RECENT DAILY PROGRESS (most recent first)');
    for (const d of context.recentDailyProgress) {
      const habits =
        [
          d.workoutCompleted && 'workout',
          d.hitWaterGoal && 'water goal',
          d.hitProteinGoal && 'protein goal',
          d.slept7PlusHours && '7+ hrs sleep',
          d.reachedStepGoal && 'step goal',
        ]
          .filter(Boolean)
          .join(', ') || 'no habits hit';
      lines.push(`- ${d.date}: weight ${d.weightKg}kg, hit: ${habits}`);
    }
  }

  lines.push('');
  lines.push(`TODAY'S WATER INTAKE: ${context.todayWaterMl}ml`);

  if (context.activeGoals.length) {
    lines.push('');
    lines.push('ACTIVE GOALS');
    for (const g of context.activeGoals) {
      lines.push(
        `- ${g.goalType}${g.targetValue ? ` (target: ${g.targetValue})` : ''}${g.targetDate ? `, by ${g.targetDate}` : ''}`,
      );
    }
  }

  return lines.join('\n');
}
