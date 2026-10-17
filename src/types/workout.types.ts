export interface ScheduledExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo: string | null;
  equipment: string | null;
  notes: string | null;
}

export interface ScheduledWorkout {
  id: string;
  dayLabel: string;
  focus: string;
  name: string | null;
  warmUp: string | null;
  coolDown: string | null;
  estimatedDurationMinutes: number | null;
  estimatedCaloriesBurned: number | null;
  coachingTips: string[];
  exercises: ScheduledExercise[];
}

/** What the user's existing active plan schedules for one calendar date. Read-only; never triggers plan generation. */
export interface WorkoutForDate {
  date: string;
  hasPlan: boolean;
  workout: ScheduledWorkout | null;
  isRestDay: boolean;
  completed: boolean;
  completedAt: string | null;
}

export interface CompleteWorkoutResult {
  completed: true;
  alreadyCompleted: boolean;
  xpGained: number;
  newAchievementTitles: string[];
  newChallengeTitles: string[];
  progress: import('./gamification.types').UserProgress;
}
