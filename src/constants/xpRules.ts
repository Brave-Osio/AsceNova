/**
 * XP reward values. Pure data — tune these without touching xpEngine's logic.
 *
 * hitWaterGoal / hitProteinGoal / slept7PlusHours / reachedStepGoal were
 * added alongside workoutCompleted as additional daily habit checkboxes.
 * The original brief only specified XP for workout/check-in/streaks, so
 * these four are valued the same as dailyCheckIn (+10 each) — each is a
 * standalone consistency signal, not a bonus on top of the workout.
 */
export const XP_REWARDS = {
  dailyCheckIn: 10,
  workoutCompleted: 50,
  hitWaterGoal: 10,
  hitProteinGoal: 10,
  slept7PlusHours: 10,
  reachedStepGoal: 10,
  sevenDayStreak: 100,
  thirtyDayStreak: 500,
  achievementUnlock: 100,
  goalProgress: 100,
} as const;
