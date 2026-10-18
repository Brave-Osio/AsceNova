import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const { prismaMock, envMock } = vi.hoisted(() => {
  const prismaMock = {
    user: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    userProgress: { findUnique: vi.fn() },
    profile: { findUnique: vi.fn() },
    dailyProgress: { findMany: vi.fn(), count: vi.fn() },
    goal: { findMany: vi.fn() },
    achievementProgress: { count: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  const envMock = { NODE_ENV: 'test', CORS_ORIGIN: 'http://localhost', CRON_SECRET: 'a-sufficiently-long-secret' };
  return { prismaMock, envMock };
});

vi.mock('../config/env.js', () => ({ env: envMock }));
vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
// Tokens in this test are just "<userId>"; the role always comes from the (mocked) database row.
vi.mock('../lib/jwt.js', () => ({
  verifyAccessToken: (token: string) => ({ sub: token, role: 'USER' }),
  signAccessToken: () => 'x',
}));

const { app } = await import('../app.js');
const { hasAtLeastRole } = await import('../lib/roles.js');

type Role = 'USER' | 'COACH' | 'ADMIN';
const accounts: Record<string, { id: string; role: Role; status: 'ACTIVE'; deleted: boolean }> = {
  admin: { id: 'admin', role: 'ADMIN', status: 'ACTIVE', deleted: false },
  coach: { id: 'coach', role: 'COACH', status: 'ACTIVE', deleted: false },
  user: { id: 'user', role: 'USER', status: 'ACTIVE', deleted: false },
};

let server: Server;
let base: string;

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
  server.close();
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) => accounts[where.id] ?? null);
  prismaMock.user.findMany.mockResolvedValue([]);
  prismaMock.user.count.mockResolvedValue(0);
  prismaMock.user.findFirst.mockResolvedValue(null);
  prismaMock.userProgress.findUnique.mockResolvedValue(null);
  prismaMock.profile.findUnique.mockResolvedValue(null);
  prismaMock.dailyProgress.findMany.mockResolvedValue([]);
  prismaMock.dailyProgress.count.mockResolvedValue(0);
  prismaMock.goal.findMany.mockResolvedValue([]);
  prismaMock.achievementProgress.count.mockResolvedValue(0);
});

function call(path: string, token?: string, method = 'GET') {
  return fetch(`${base}${path}`, { method, headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

describe('role hierarchy', () => {
  it('orders USER < COACH < ADMIN', () => {
    expect(hasAtLeastRole('USER', 'COACH')).toBe(false);
    expect(hasAtLeastRole('COACH', 'COACH')).toBe(true);
    expect(hasAtLeastRole('COACH', 'ADMIN')).toBe(false);
    expect(hasAtLeastRole('ADMIN', 'COACH')).toBe(true);
  });
});

describe('coach endpoints are COACH-or-above', () => {
  const ROUTES = ['/api/coach/clients', '/api/coach/clients/c1/dashboard'];

  it.each(ROUTES)('%s rejects unauthenticated requests with 401', async (path) => {
    expect((await call(path)).status).toBe(401);
  });

  it.each(ROUTES)('%s rejects a normal user with 403', async (path) => {
    expect((await call(path, 'user')).status).toBe(403);
  });

  it('keeps coaches out of the admin API', async () => {
    expect((await call('/api/admin/users', 'coach')).status).toBe(403);
    expect((await call('/api/admin/coaches', 'coach')).status).toBe(403);
    expect((await call('/api/admin/users/x/grant-coach', 'coach', 'POST')).status).toBe(403);
    expect((await call('/api/admin/coaches/c/clients', 'coach', 'POST')).status).toBe(403);
  });

  it('keeps normal users out of the admin coach-management routes', async () => {
    expect((await call('/api/admin/coaches', 'user')).status).toBe(403);
    expect((await call('/api/admin/users/x/revoke-coach', 'user', 'POST')).status).toBe(403);
  });
});

describe('coach client scoping', () => {
  it('limits a coach to their own active, assigned clients', async () => {
    const res = await call('/api/coach/clients', 'coach');
    expect(res.status).toBe(200);
    const where = prismaMock.user.findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({ deleted: false, coachAssignment: { is: { coachId: 'coach', active: true } } });
  });

  it('lets an admin list everyone except themselves', async () => {
    await call('/api/coach/clients', 'admin');
    const where = prismaMock.user.findMany.mock.calls[0][0].where;
    expect(where).toEqual({ deleted: false, id: { not: 'admin' } });
  });

  it('returns 404 and audits a FAILURE when a coach opens an unassigned account', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await call('/api/coach/clients/stranger/dashboard', 'coach');
    expect(res.status).toBe(404);
    const where = prismaMock.user.findFirst.mock.calls[0][0].where;
    expect(where).toEqual({
      AND: [{ id: 'stranger' }, { deleted: false, coachAssignment: { is: { coachId: 'coach', active: true } } }],
    });
    expect(prismaMock.auditLog.create.mock.calls[0][0].data).toMatchObject({
      actorId: 'coach',
      action: 'COACH_VIEW_CLIENT_DASHBOARD',
      targetId: 'stranger',
      outcome: 'FAILURE',
    });
  });
});

describe('client dashboard privacy', () => {
  beforeEach(() => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user',
      email: 'client@example.com',
      role: 'USER',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });
    prismaMock.userProgress.findUnique.mockResolvedValue({
      totalXp: 600,
      cachedRank: 'BRONZE',
      currentStreak: 4,
      longestStreak: 9,
      lastLogDate: new Date('2026-10-18T00:00:00Z'),
    });
    prismaMock.dailyProgress.findMany.mockResolvedValue([
      {
        date: new Date('2026-10-18T00:00:00Z'),
        workoutCompleted: true,
        hitWaterGoal: true,
        hitProteinGoal: false,
        slept7PlusHours: true,
        reachedStepGoal: false,
      },
    ]);
  });

  it('only selects whitelisted activity/goal fields — no weight, notes, steps, sleep numbers or goal values', async () => {
    const res = await call('/api/coach/clients/user/dashboard', 'coach');
    expect(res.status).toBe(200);

    const logSelect = Object.keys(prismaMock.dailyProgress.findMany.mock.calls[0][0].select);
    for (const forbidden of ['weightKg', 'notes', 'stepsCount', 'sleepHours']) {
      expect(logSelect).not.toContain(forbidden);
    }
    const goalSelect = Object.keys(prismaMock.goal.findMany.mock.calls[0][0].select);
    for (const forbidden of ['targetValue', 'progressNote']) {
      expect(goalSelect).not.toContain(forbidden);
    }
    const profileSelect = Object.keys(prismaMock.profile.findUnique.mock.calls[0][0].select);
    expect(profileSelect.sort()).toEqual(['fitnessLevel', 'goal']);
    const userSelect = Object.keys(prismaMock.user.findFirst.mock.calls[0][0].select);
    for (const forbidden of ['passwordHash', 'recoveryEmail', 'googleId']) {
      expect(userSelect).not.toContain(forbidden);
    }

    const body = await res.json();
    expect(body.progress).toMatchObject({ totalXp: 600, rank: 'BRONZE', currentStreak: 4, lastLogDate: '2026-10-18' });
    expect(body.activity[0]).toEqual({
      date: '2026-10-18',
      workoutCompleted: true,
      hitWaterGoal: true,
      hitProteinGoal: false,
      slept7PlusHours: true,
      reachedStepGoal: false,
    });
  });

  it('audits the view without putting the username in the audit row', async () => {
    await call('/api/coach/clients/user/dashboard', 'coach');
    const row = prismaMock.auditLog.create.mock.calls[0][0].data;
    expect(row).toMatchObject({
      actorId: 'coach',
      action: 'COACH_VIEW_CLIENT_DASHBOARD',
      targetType: 'USER',
      targetId: 'user',
      outcome: 'SUCCESS',
    });
    expect(JSON.stringify(row)).not.toContain('client@example.com');
  });

  it("lets an admin open any other account's dashboard", async () => {
    const res = await call('/api/coach/clients/user/dashboard', 'admin');
    expect(res.status).toBe(200);
    expect(prismaMock.user.findFirst.mock.calls[0][0].where).toEqual({
      AND: [{ id: 'user' }, { deleted: false, id: { not: 'admin' } }],
    });
  });
});
