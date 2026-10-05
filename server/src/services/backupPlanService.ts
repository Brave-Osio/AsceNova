import type { FitnessLevel, Profile, WorkoutSplitStyle } from '@prisma/client';
import { BACKUP_TEMPLATES, type BackupTemplate } from '../data/backupWorkoutTemplates.js';
import type { EnrichedWorkoutDay } from './workoutGenerationService.js';

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

/** Best-fitting template for the profile within the chosen split. Deterministic. */
export function selectBackupTemplate(profile: Profile, splitStyle: WorkoutSplitStyle): BackupTemplate {
  let best: { template: BackupTemplate; score: number } | null = null;

  for (const template of BACKUP_TEMPLATES) {
    if (template.splitStyle !== splitStyle) continue;
    const score = scoreTemplate(template, profile);
    if (score === null) continue;
    if (!best || score > best.score || (score === best.score && template.id < best.template.id)) {
      best = { template, score };
    }
  }

  if (!best) {
    throw new Error(`No backup template available for split ${splitStyle}`);
  }
  return best.template;
}

export function selectBackupDays(profile: Profile, splitStyle: WorkoutSplitStyle): EnrichedWorkoutDay[] {
  return selectBackupTemplate(profile, splitStyle).days;
}
