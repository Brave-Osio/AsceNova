import type { FitnessLevel, Profile, WorkoutSplitStyle } from '@prisma/client';
import { BACKUP_TEMPLATES, type BackupTemplate } from '../data/backupWorkoutTemplates.js';
import { countTrainingDays, isRestDay, toRestDay, type EnrichedWorkoutDay } from './workoutGenerationService.js';

const LEVEL_NUM: Record<FitnessLevel, number> = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };

function isLowImpactCandidate(profile: Profile): boolean {
  const heightM = profile.heightCm / 100;
  const bmi = heightM > 0 ? profile.currentWeightKg / (heightM * heightM) : 0;
  return profile.age >= 45 || bmi >= 30;
}

/**
 * How well a backup template fits a profile. Higher is better; null means the
 * template is unusable (HOME-only users never get a gym plan).
 */
export function scoreTemplate(template: BackupTemplate, profile: Profile): number | null {
  if (profile.equipmentAccess === 'HOME' && template.equipment === 'GYM') return null;

  let score = 0;

  if (template.goals.includes(profile.goal)) score += 5;

  if (template.levels.includes(profile.fitnessLevel)) {
    score += 4;
  } else if (template.levels.some((l) => Math.abs(LEVEL_NUM[l] - LEVEL_NUM[profile.fitnessLevel]) === 1)) {
    score += 1;
  }

  if (profile.equipmentAccess === 'GYM') score += template.equipment === 'GYM' ? 4 : 0;
  else if (profile.equipmentAccess === 'BOTH') score += template.equipment === 'GYM' ? 4 : 2;
  else score += 4;

  if (profile.workoutFrequency != null) {
    const gap = Math.abs(template.daysPerWeek - profile.workoutFrequency);
    score += gap === 0 ? 3 : gap === 1 ? 2 : gap === 2 ? 1 : 0;
  }

  const lowImpact = template.tags.includes('LOW_IMPACT');
  if (isLowImpactCandidate(profile)) {
    if (lowImpact) score += 2;
  } else if (lowImpact) {
    // Nudge ties toward the standard plan when joint care isn't needed.
    score -= 0.5;
  }

  if (profile.activityLevel === 'SEDENTARY' || profile.activityLevel === 'LIGHTLY_ACTIVE') {
    if (template.daysPerWeek <= 4) score += 1;
  } else if (profile.activityLevel === 'VERY_ACTIVE' || profile.activityLevel === 'EXTRA_ACTIVE') {
    if (template.daysPerWeek >= 5) score += 1;
  }

  return score;
}

/**
 * How far a template is from a requested frequency. Templates with extra days are
 * preferred (they can be trimmed to fit); ones with too few days rank far behind.
 */
function frequencyDistance(template: BackupTemplate, frequency: number): number {
  return template.daysPerWeek >= frequency
    ? template.daysPerWeek - frequency
    : 1000 + (frequency - template.daysPerWeek);
}

/** Best-fitting template for the profile within the chosen split. Deterministic. */
export function selectBackupTemplate(profile: Profile, splitStyle: WorkoutSplitStyle): BackupTemplate {
  const candidates = BACKUP_TEMPLATES.filter(
    (t) => t.splitStyle === splitStyle && scoreTemplate(t, profile) !== null,
  );

  // The stated training frequency is a hard requirement, not just a scoring nudge.
  let pool = candidates;
  if (profile.workoutFrequency != null && candidates.length > 0) {
    const frequency = profile.workoutFrequency;
    const closest = Math.min(...candidates.map((t) => frequencyDistance(t, frequency)));
    pool = candidates.filter((t) => frequencyDistance(t, frequency) === closest);
  }

  let best: { template: BackupTemplate; score: number } | null = null;
  for (const template of pool) {
    const score = scoreTemplate(template, profile) ?? 0;
    if (!best || score > best.score || (score === best.score && template.id < best.template.id)) {
      best = { template, score };
    }
  }

  if (!best) {
    throw new Error(`No backup template available for split ${splitStyle}`);
  }
  return best.template;
}

const LIGHT_FOCUS = /cardio|mobility|light/i;

/**
 * Turns the lowest-value training days into Rest days until exactly `frequency`
 * remain: cardio/mobility days go first, then the latest strength days. A
 * template with fewer days than requested is returned as-is (none is longer).
 */
export function fitDaysToFrequency(days: EnrichedWorkoutDay[], frequency: number): EnrichedWorkoutDay[] {
  const excess = countTrainingDays(days) - frequency;
  if (excess <= 0) return days;

  const dropOrder = days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => !isRestDay(day))
    .sort((a, b) => {
      const aLight = LIGHT_FOCUS.test(a.day.focus) ? 0 : 1;
      const bLight = LIGHT_FOCUS.test(b.day.focus) ? 0 : 1;
      return aLight - bLight || b.index - a.index;
    })
    .slice(0, excess)
    .map(({ index }) => index);

  return days.map((day, index) => (dropOrder.includes(index) ? toRestDay(day) : day));
}

export function selectBackupDays(profile: Profile, splitStyle: WorkoutSplitStyle): EnrichedWorkoutDay[] {
  const days = selectBackupTemplate(profile, splitStyle).days;
  return profile.workoutFrequency != null ? fitDaysToFrequency(days, profile.workoutFrequency) : days;
}
