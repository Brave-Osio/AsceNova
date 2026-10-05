import type { AchievementDefinition } from '../types/gamification.types';

/**
 * achievementEngine evaluates user state against these definitions
 * to decide which ids to unlock. IDs are stable strings — never the
 * array index — so storage references survive reordering this list.
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_workout',
    title: 'First Workout',
    description: 'Complete your very first workout.',
    icon: '🏅',
  },
  {
    id: 'first_week_completed',
    title: 'First Week Completed',
    description: 'Log every day for your first 7 days.',
    icon: '🏅',
  },
  {
    id: 'seven_day_streak',
    title: '7-Day Streak',
    description: 'Reach a 7-day logging streak.',
    icon: '🏅',
  },
  {
    id: 'thirty_day_streak',
    title: '30-Day Streak',
    description: 'Reach a 30-day logging streak.',
    icon: '🏅',
  },
  {
    id: 'bronze_promotion',
    title: 'Bronze Promotion',
    description: 'Reach Bronze rank.',
    icon: '🏅',
  },
  {
    id: 'silver_promotion',
    title: 'Silver Promotion',
    description: 'Reach Silver rank.',
    icon: '🏅',
  },
  {
    id: 'gold_promotion',
    title: 'Gold Promotion',
    description: 'Reach Gold rank.',
    icon: '🏅',
  },
  {
    id: 'consistency_master',
    title: 'Consistency Master',
    description: 'Log 50 days total.',
    icon: '🏅',
  },
  {
    id: 'discipline_champion',
    title: 'Discipline Champion',
    description: 'Reach a 100-day streak.',
    icon: '🏅',
  },
  {
    id: 'hydration_hero',
    title: 'Hydration Hero',
    description: 'Hit your water goal on 14 logged days.',
    icon: '💧',
  },
  {
    id: 'protein_pro',
    title: 'Protein Pro',
    description: 'Hit your protein goal on 14 logged days.',
    icon: '🍗',
  },
  {
    id: 'twenty_workouts',
    title: 'Twenty Workouts',
    description: 'Complete 20 workouts.',
    icon: '💪',
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Reach your goal weight.',
    icon: '🎯',
  },
  {
    id: 'ask_the_coach',
    title: 'Ask the Coach',
    description: 'Send your first message to the AI Coach.',
    icon: '🤖',
  },
  {
    id: 'platinum_promotion',
    title: 'Platinum Promotion',
    description: 'Reach Platinum rank.',
    icon: '💠',
  },
];
