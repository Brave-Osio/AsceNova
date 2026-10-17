import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    dailyProgress: { upsert: vi.fn(), findUnique: vi.fn() },
    workoutLog: { findFirst: vi.fn() },
  },
}));

vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));

const { upsertLog, getLogForDate } = await import('./dailyProgressService.js');

const input = (date: string, workoutCompleted = false) => ({
  date: new Date(`${date}T00:00:00Z`),
  weightKg: 70,
  workoutCompleted,
  hitWaterGoal: false,
  hitProteinGoal: false,
  slept7PlusHours: false,
  reachedStepGoal: false,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.dailyProgress.upsert.mockResolvedValue({});
});

describe('daily progress is keyed by calendar date', () => {
  it('writes to that date’s own row (unique per user+date), never a shared mutable one', async () => {
    prismaMock.workoutLog.findFirst.mockResolvedValue(null);
    await upsertLog('u1', input('2026-10-19'));
    expect(prismaMock.dailyProgress.upsert.mock.calls[0][0].where).toEqual({
      userId_date: { userId: 'u1', date: new Date('2026-10-19T00:00:00Z') },
    });
  });

  it('reads a single day: a new day with no row is null (starts at zero), yesterday stays intact', async () => {
    prismaMock.dailyProgress.findUnique.mockImplementation(async ({ where }: { where: { userId_date: { date: Date } } }) =>
      where.userId_date.date.toISOString().startsWith('2026-10-18') ? { workoutCompleted: true } : null,
    );
    expect(await getLogForDate('u1', new Date('2026-10-19T00:00:00Z'))).toBeNull();
    expect(await getLogForDate('u1', new Date('2026-10-18T00:00:00Z'))).toEqual({ workoutCompleted: true });
  });
});

describe('upsertLog and Mark-as-Done', () => {
  it('keeps workoutCompleted true when a workout was already completed that day, even if the form leaves it unticked', async () => {
    prismaMock.workoutLog.findFirst.mockResolvedValue({ id: 'log-1' });
    await upsertLog('u1', input('2026-10-19', false));
    const call = prismaMock.dailyProgress.upsert.mock.calls[0][0];
    expect(call.update.workoutCompleted).toBe(true);
    expect(call.create.workoutCompleted).toBe(true);
  });

  it('leaves the form’s value alone when no workout was completed that day', async () => {
    prismaMock.workoutLog.findFirst.mockResolvedValue(null);
    await upsertLog('u1', input('2026-10-19', false));
    expect(prismaMock.dailyProgress.upsert.mock.calls[0][0].update.workoutCompleted).toBe(false);
  });

  it('only consults the caller’s own workout logs for that exact date', async () => {
    prismaMock.workoutLog.findFirst.mockResolvedValue(null);
    await upsertLog('u1', input('2026-10-19'));
    expect(prismaMock.workoutLog.findFirst.mock.calls[0][0].where).toMatchObject({
      userId: 'u1',
      date: new Date('2026-10-19T00:00:00Z'),
    });
  });
});
