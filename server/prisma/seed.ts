import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Verbatim from src/constants/achievements.ts — ids are stable strings,
// xpReward matches XP_REWARDS.achievementUnlock (100) from src/constants/xpRules.ts.
const ACHIEVEMENTS = [
  { id: 'first_workout', title: 'First Workout', description: 'Complete your very first workout.', icon: '🏅' },
  { id: 'first_week_completed', title: 'First Week Completed', description: 'Log every day for your first 7 days.', icon: '🏅' },
  { id: 'seven_day_streak', title: '7-Day Streak', description: 'Reach a 7-day logging streak.', icon: '🏅' },
  { id: 'thirty_day_streak', title: '30-Day Streak', description: 'Reach a 30-day logging streak.', icon: '🏅' },
  { id: 'bronze_promotion', title: 'Bronze Promotion', description: 'Reach Bronze rank.', icon: '🏅' },
  { id: 'silver_promotion', title: 'Silver Promotion', description: 'Reach Silver rank.', icon: '🏅' },
  { id: 'gold_promotion', title: 'Gold Promotion', description: 'Reach Gold rank.', icon: '🏅' },
  { id: 'consistency_master', title: 'Consistency Master', description: 'Log 50 days total.', icon: '🏅' },
  { id: 'discipline_champion', title: 'Discipline Champion', description: 'Reach a 100-day streak.', icon: '🏅' },
  { id: 'hydration_hero', title: 'Hydration Hero', description: 'Hit your water goal on 14 logged days.', icon: '💧' },
  { id: 'protein_pro', title: 'Protein Pro', description: 'Hit your protein goal on 14 logged days.', icon: '🍗' },
  { id: 'twenty_workouts', title: 'Twenty Workouts', description: 'Complete 20 workouts.', icon: '💪' },
  { id: 'goal_crusher', title: 'Goal Crusher', description: 'Reach your goal weight.', icon: '🎯' },
  { id: 'ask_the_coach', title: 'Ask the Coach', description: 'Send your first message to the AI Coach.', icon: '🤖' },
  { id: 'platinum_promotion', title: 'Platinum Promotion', description: 'Reach Platinum rank.', icon: '💠' },
];

async function seedAchievements() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { id: a.id },
      update: { title: a.title, description: a.description, icon: a.icon },
      create: { ...a, xpReward: 100 },
    });
  }
  console.log(`Seeded ${ACHIEVEMENTS.length} achievements.`);
}

async function seedAdminUser() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping admin seed user — NODE_ENV=production.');
    return;
  }
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    console.log('Skipping admin seed user — ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: 'ADMIN' },
  });
  await prisma.userProgress.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  console.log(`Seeded admin user: ${email}`);
}

async function main() {
  await seedAchievements();
  await seedAdminUser();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
