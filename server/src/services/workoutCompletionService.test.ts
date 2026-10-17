import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock, applyDailyLog } = vi.hoisted(() => {
  const txMock = {
    workoutLog: { createMany: vi.fn() },
    dailyProgress: { upsert: vi.fn() },
  };
  const prismaMock = {
    workoutDay: { findFirst: vi.fn() },
    workoutPlan: { findFirst: vi.fn() },
    workoutLog: { findFirst: vi.fn() },
    profile: { findUnique: vi.fn() },
    dailyProgress: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  };
  return { prismaMock, txMock, applyDailyLog: vi.fn() };
});

vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
vi.mock('./progressService.js', () => ({ applyDailyLog }));
vi.mock('./workoutGenerationService.js', () => ({ REST_FOCUS: 'Rest' }));

const { completeWorkout, getWorkoutForDate, assertDateInWindow, parseDateOnly, weekdayIndexForDate } = await import(
  './workoutCompletionService.js'
);

// 2026-10-19 is a Monday.
const MONDAY = '2026-10-19';
const monday = { id: 'day-mon', dayIndex: 0, focus: 'Push Day', exercises: [{ id: 'e1' }], estimatedDurationMinutes: 45, estimatedCaloriesBurned: 300 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));
  prismaMock.$transaction.mockImplementation((fn: (tx: typeof txMock) => unknown) => fn(txMock));
  prismaMock.workoutDay.findFirst.mockResolvedValue(monday);
  prismaMock.profile.findUnique.mockResolvedValue({ currentWeightKg: 70 });
  prismaMock.dailyProgress.findFirst.mockResolvedValue(null);
  txMock.workoutLog.createMany.mockResolvedValue({ count: 1 });
  applyDailyLog.mockResolvedValue({ progress: {}, xpGained: 60, newAchievementTitles: [], newChallengeTitles: [] });
});

describe('date handling', () => {
  it('parses only real calendar dates', () => {
    expect(parseDateOnly('2026-10-19').toISOString()).toBe('2026-10-19T00:00:00.000Z');
    for (const bad of ['2026-02-30', '2026-13-01', 'yesterday', '2026-1-1', '']) {
      expect(() => parseDateOnly(bad)).toThrow('Invalid date');
    }
  });

  it('maps dates to plan day indexes with Monday = 0', () => {
    expect(weekdayIndexForDate(parseDateOnly('2026-10-19'))).toBe(0);
    expect(weekdayIndexForDate(parseDateOnly('2026-10-25'))).toBe(6); // Sunday
  });

  it('accepts dates within one day of server UTC either side of "today" and a week of backfill, nothing beyond', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    expect(() => assertDateInWindow(parseDateOnly('2026-10-20'), now)).not.toThrow(); // user ahead of UTC
    expect(() => assertDateInWindow(parseDateOnly('2026-10-12'), now)).not.toThrow();
    expect(() => assertDateInWindow(parseDateOnly('2026-10-21'), now)).toThrow('outside');
    expect(() => assertDateInWindow(parseDateOnly('2026-10-11'), now)).toThrow('outside');
  });
});

describe('getWorkoutForDate', () => {
  it('never generates a plan: reports hasPlan=false when none exists', async () => {
    prismaMock.workoutPlan.findFirst.mockResolvedValue(null);
    const out = await getWorkoutForDate('u1', MONDAY);
    expect(out).toMatchObject({ hasPlan: false, workout: null, completed: false });
  });

  it('reports a rest day when the date maps to a Rest day', async () => {
    prismaMock.workoutPlan.findFirst.mockResolvedValue({ id: 'p', workoutDays: [{ id: 'd', focus: 'Rest', exercises: [] }] });
    const out = await getWorkoutForDate('u1', MONDAY);
    expect(out).toMatchObject({ hasPlan: true, isRestDay: true, workout: null });
  });

  it('only looks at the active plan of the authenticated user and the date’s weekday', async () => {
    prismaMock.workoutPlan.findFirst.mockResolvedValue({ id: 'p', workoutDays: [] });
    await getWorkoutForDate('u1', '2026-10-21'); // Wednesday
    const args = prismaMock.workoutPlan.findFirst.mock.calls[0][0];
    expect(args.where).toEqual({ userId: 'u1', isActive: true });
    expect(args.select.workoutDays.where).toEqual({ dayIndex: 2 });
  });

  it('shows completion status only for the selected date', async () => {
    prismaMock.workoutPlan.findFirst.mockResolvedValue({ id: 'p', workoutDays: [{ ...monday, label: 'Monday', exercises: [{ id: 'e1', name: 'Bench' }] }] });
    prismaMock.workoutLog.findFirst.mockResolvedValue(null);
    expect((await getWorkoutForDate('u1', MONDAY)).completed).toBe(false);
    expect(prismaMock.workoutLog.findFirst.mock.calls[0][0].where.date).toEqual(parseDateOnly(MONDAY));

    prismaMock.workoutLog.findFirst.mockResolvedValue({ createdAt: new Date('2026-10-19T08:00:00Z') });
    expect((await getWorkoutForDate('u1', MONDAY)).completed).toBe(true);
  });
});

describe('completeWorkout', () => {
  it('rejects a workout day that is not in the caller’s active plan (ownership check)', async () => {
    prismaMock.workoutDay.findFirst.mockResolvedValue(null);
    await expect(completeWorkout('u1', 'someone-elses-day', MONDAY)).rejects.toMatchObject({ status: 404 });
    expect(prismaMock.workoutDay.findFirst.mock.calls[0][0].where).toEqual({
      id: 'someone-elses-day',
      workoutPlan: { userId: 'u1', isActive: true },
    });
    expect(txMock.workoutLog.createMany).not.toHaveBeenCalled();
    expect(applyDailyLog).not.toHaveBeenCalled();
  });

  it('rejects a date that does not match the day’s scheduled weekday', async () => {
    await expect(completeWorkout('u1', 'day-mon', '2026-10-20')).rejects.toMatchObject({ status: 400 });
    expect(txMock.workoutLog.createMany).not.toHaveBeenCalled();
  });

  it('rejects rest days', async () => {
    prismaMock.workoutDay.findFirst.mockResolvedValue({ ...monday, focus: 'Rest', exercises: [] });
    await expect(completeWorkout('u1', 'day-mon', MONDAY)).rejects.toMatchObject({ status: 400 });
  });

  it('rejects dates outside the allowed window', async () => {
    await expect(completeWorkout('u1', 'day-mon', '2026-12-07')).rejects.toMatchObject({ status: 400 });
  });

  it('records the log, flags daily progress and applies rewards on first completion', async () => {
    const out = await completeWorkout('u1', 'day-mon', MONDAY);

    expect(txMock.workoutLog.createMany.mock.calls[0][0]).toMatchObject({ skipDuplicates: true });
    expect(txMock.workoutLog.createMany.mock.calls[0][0].data[0]).toMatchObject({ userId: 'u1', workoutDayId: 'day-mon' });
    expect(txMock.dailyProgress.upsert.mock.calls[0][0].update).toEqual({ workoutCompleted: true });
    expect(applyDailyLog).toHaveBeenCalledWith('u1', parseDateOnly(MONDAY));
    expect(out).toMatchObject({ completed: true, alreadyCompleted: false, xpGained: 60 });
  });

  it('is idempotent: a duplicate submit creates no second log and reports alreadyCompleted', async () => {
    txMock.workoutLog.createMany.mockResolvedValue({ count: 0 }); // unique index swallowed the insert
    applyDailyLog.mockResolvedValue({ progress: {}, xpGained: 0, newAchievementTitles: [], newChallengeTitles: [] });

    const out = await completeWorkout('u1', 'day-mon', MONDAY);

    expect(out).toMatchObject({ completed: true, alreadyCompleted: true, xpGained: 0 });
  });

  it('two concurrent submits: only one is “first”, neither errors', async () => {
    txMock.workoutLog.createMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const [a, b] = await Promise.all([completeWorkout('u1', 'day-mon', MONDAY), completeWorkout('u1', 'day-mon', MONDAY)]);
    expect([a.alreadyCompleted, b.alreadyCompleted].sort()).toEqual([false, true]);
  });

  it('does not report success when the backend fails', async () => {
    txMock.workoutLog.createMany.mockRejectedValue(new Error('db down'));
    await expect(completeWorkout('u1', 'day-mon', MONDAY)).rejects.toThrow('db down');
    expect(applyDailyLog).not.toHaveBeenCalled();
  });
});
