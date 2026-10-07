export interface TitleDefinition {
  achievementId: string;
  title: string;
}

/**
 * Ordered most to least prestigious. getEquippedTitle picks the first
 * entry whose achievement the user has actually unlocked — purely
 * derived from unlockedAchievementIds (already available client-side
 * via useUserProgress), no backend/schema change needed.
 */
export const TITLE_PRIORITY: TitleDefinition[] = [
  { achievementId: 'discipline_champion', title: 'The Disciplined' },
  { achievementId: 'platinum_promotion', title: 'Platinum Elite' },
  { achievementId: 'consistency_master', title: 'The Consistent' },
  { achievementId: 'goal_crusher', title: 'Goal Crusher' },
  { achievementId: 'thirty_day_streak', title: 'Streak Master' },
  { achievementId: 'gold_promotion', title: 'Golden' },
  { achievementId: 'hydration_hero', title: 'Hydration Hero' },
  { achievementId: 'protein_pro', title: 'Protein Pro' },
  { achievementId: 'first_workout', title: 'Newcomer' },
];

export function getEquippedTitle(unlockedAchievementIds: string[]): string | null {
  const match = TITLE_PRIORITY.find((t) => unlockedAchievementIds.includes(t.achievementId));
  return match?.title ?? null;
}
