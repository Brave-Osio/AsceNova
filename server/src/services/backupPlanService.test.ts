import { describe, it, expect } from 'vitest';
import type { Profile, WorkoutSplitStyle } from '@prisma/client';
import { BACKUP_TEMPLATES } from '../data/backupWorkoutTemplates.js';
import { selectBackupTemplate, selectBackupDays } from './backupPlanService.js';
import { countTrainingDays, workoutDetailResponseSchema } from './workoutGenerationService.js';

const SPLITS: WorkoutSplitStyle[] = ['PUSH_PULL_LEGS', 'UPPER_LOWER', 'FULL_BODY'];

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p',
    userId: 'u',
    fullName: 'Test User',
    birthday: null,
    age: 28,
    gender: null,
    heightCm: 175,
    currentWeightKg: 70,
    goalWeightKg: null,
    goal: 'MAINTAIN_WEIGHT',
    fitnessLevel: 'INTERMEDIATE',
    equipmentAccess: 'GYM',
    activityLevel: null,
    workoutFrequency: null,
    preferredSplitStyle: null,
    dailySchedule: null,
    sleepHoursTarget: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BACKUP_TEMPLATES', () => {
  it.each(SPLITS)('has 20 templates for %s', (split) => {
    expect(BACKUP_TEMPLATES.filter((t) => t.splitStyle === split)).toHaveLength(20);
  });

  it('has unique ids', () => {
    const ids = BACKUP_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every template is a valid 7-day plan with real exercises on training days', () => {
    for (const template of BACKUP_TEMPLATES) {
      expect(template.days, template.id).toHaveLength(7);
      expect(() => workoutDetailResponseSchema.parse({ days: template.days }), template.id).not.toThrow();
      expect(template.days.map((d) => d.day)).toEqual([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]);
      for (const day of template.days) {
        if (day.focus === 'Rest') {
          expect(day.exercises).toHaveLength(0);
        } else {
          expect(day.exercises.length, `${template.id} ${day.day}`).toBeGreaterThanOrEqual(2);
        }
      }
      expect(template.daysPerWeek).toBe(template.days.filter((d) => d.focus !== 'Rest').length);
    }
  });

  it('never repeats an exercise within a day', () => {
    for (const template of BACKUP_TEMPLATES) {
      for (const day of template.days) {
        const names = day.exercises.map((e) => e.name);
        expect(new Set(names).size, `${template.id} ${day.day}`).toBe(names.length);
      }
    }
  });

  it('HOME templates contain no gym-only equipment', () => {
    const gymOnly = ['Barbell', 'Machine', 'Cable', 'Treadmill', 'Dip bars', 'Smith machine', 'Rower', 'Elliptical'];
    for (const template of BACKUP_TEMPLATES.filter((t) => t.equipment === 'HOME')) {
      for (const day of template.days) {
        for (const ex of day.exercises) {
          expect(gymOnly.some((g) => (ex.equipment ?? '').includes(g)), `${template.id}: ${ex.name}`).toBe(false);
        }
      }
    }
  });

  it('low-impact templates exclude jumping moves', () => {
    const jumpy = /jump|burpee|mountain climber/i;
    for (const template of BACKUP_TEMPLATES.filter((t) => t.tags.includes('LOW_IMPACT'))) {
      for (const day of template.days) {
        for (const ex of day.exercises) {
          expect(jumpy.test(ex.name), `${template.id}: ${ex.name}`).toBe(false);
        }
      }
    }
  });

  it('templates within a split are not all identical', () => {
    for (const split of SPLITS) {
      const signatures = new Set(
        BACKUP_TEMPLATES.filter((t) => t.splitStyle === split).map((t) =>
          t.days.flatMap((d) => d.exercises.map((e) => e.name)).join('|'),
        ),
      );
      expect(signatures.size).toBeGreaterThanOrEqual(15);
    }
  });
});

describe('selectBackupTemplate', () => {
  it('never gives a home-only user a gym template, for any profile mix', () => {
    for (const split of SPLITS) {
      for (const goal of ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTAIN_WEIGHT'] as const) {
        for (const level of ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const) {
          const t = selectBackupTemplate(makeProfile({ equipmentAccess: 'HOME', goal, fitnessLevel: level }), split);
          expect(t.equipment).toBe('HOME');
          expect(t.splitStyle).toBe(split);
        }
      }
    }
  });

  it('matches goal, level and equipment when an exact template exists', () => {
    const t = selectBackupTemplate(
      makeProfile({ goal: 'MUSCLE_GAIN', fitnessLevel: 'ADVANCED', equipmentAccess: 'GYM' }),
      'PUSH_PULL_LEGS',
    );
    expect(t.goals).toEqual(['MUSCLE_GAIN']);
    expect(t.levels).toEqual(['ADVANCED']);
    expect(t.equipment).toBe('GYM');
  });

  it('prefers the template whose training days match the stated frequency', () => {
    const three = selectBackupTemplate(
      makeProfile({ goal: 'MUSCLE_GAIN', fitnessLevel: 'INTERMEDIATE', workoutFrequency: 3 }),
      'UPPER_LOWER',
    );
    const six = selectBackupTemplate(
      makeProfile({ goal: 'MUSCLE_GAIN', fitnessLevel: 'INTERMEDIATE', workoutFrequency: 6 }),
      'UPPER_LOWER',
    );
    expect(Math.abs(three.daysPerWeek - 3)).toBeLessThanOrEqual(Math.abs(six.daysPerWeek - 3));
    expect(six.daysPerWeek).toBeGreaterThanOrEqual(three.daysPerWeek);
  });

  it.each(SPLITS)('selectBackupDays hits the stated frequency for %s (3-6 days exactly)', (split) => {
    for (let n = 3; n <= 6; n++) {
      for (const goal of ['WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTAIN_WEIGHT'] as const) {
        const days = selectBackupDays(makeProfile({ workoutFrequency: n, goal }), split);
        expect(days, `${split} ${goal} n=${n}`).toHaveLength(7);
        expect(countTrainingDays(days), `${split} ${goal} n=${n}`).toBe(n);
      }
    }
  });

  it.each(SPLITS)('selectBackupDays trims to 1 or 2 days for %s, with no exercises on Rest days', (split) => {
    for (const n of [1, 2]) {
      const days = selectBackupDays(makeProfile({ workoutFrequency: n }), split);
      expect(countTrainingDays(days)).toBe(n);
      for (const day of days.filter((d) => d.focus === 'Rest')) expect(day.exercises).toHaveLength(0);
    }
  });

  it('prefers a low-impact plan for older users', () => {
    const t = selectBackupTemplate(
      makeProfile({ age: 58, goal: 'MAINTAIN_WEIGHT', fitnessLevel: 'BEGINNER', equipmentAccess: 'HOME' }),
      'FULL_BODY',
    );
    expect(t.tags).toContain('LOW_IMPACT');
  });

  it('is deterministic', () => {
    const profile = makeProfile({ goal: 'WEIGHT_LOSS', fitnessLevel: 'BEGINNER' });
    expect(selectBackupTemplate(profile, 'FULL_BODY').id).toBe(selectBackupTemplate(profile, 'FULL_BODY').id);
  });
});
