import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const { prismaMock, envMock } = vi.hoisted(() => {
  const prismaMock = {
    user: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    dailyProgress: { groupBy: vi.fn(), count: vi.fn() },
    auditLog: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  };
  const envMock = { NODE_ENV: 'test', CORS_ORIGIN: 'http://localhost', CRON_SECRET: 'a-sufficiently-long-secret' };
  return { prismaMock, envMock };
});

vi.mock('../config/env.js', () => ({ env: envMock }));
vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
// Tokens in this test are just "<userId>" — signature handling is jwt.ts's job, not what's under test.
vi.mock('../lib/jwt.js', () => ({
  verifyAccessToken: (token: string) => {
    if (token === 'bad') throw new Error('bad token');
    return { sub: token, role: 'USER' };
  },
  signAccessToken: () => 'x',
}));

const { app } = await import('../app.js');

type Account = { id: string; role: 'USER' | 'ADMIN'; status: 'ACTIVE' | 'SUSPENDED'; deleted: boolean };
const accounts: Record<string, Account> = {
  admin: { id: 'admin', role: 'ADMIN', status: 'ACTIVE', deleted: false },
  user: { id: 'user', role: 'USER', status: 'ACTIVE', deleted: false },
  ghost: { id: 'ghost', role: 'USER', status: 'ACTIVE', deleted: true },
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
  prismaMock.auditLog.findMany.mockResolvedValue([]);
  prismaMock.auditLog.count.mockResolvedValue(0);
  prismaMock.user.findMany.mockResolvedValue([]);
  prismaMock.user.count.mockResolvedValue(0);
});

function call(path: string, token?: string, method = 'GET') {
  return fetch(`${base}${path}`, { method, headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

const ADMIN_GET_ROUTES = ['/api/admin/stats', '/api/admin/users', '/api/admin/audit-logs', '/api/admin/ai-usage', '/api/admin/users/export'];

describe('admin endpoints are admin-only on the backend', () => {
  it.each(ADMIN_GET_ROUTES)('%s rejects unauthenticated requests with 401', async (path) => {
    expect((await call(path)).status).toBe(401);
  });

  it.each(ADMIN_GET_ROUTES)('%s rejects a normal user with 403', async (path) => {
    expect((await call(path, 'user')).status).toBe(403);
  });

  it('rejects a soft-deleted account holding a still-valid token', async () => {
    expect((await call('/api/admin/audit-logs', 'ghost')).status).toBe(401);
    expect((await call('/api/profile', 'ghost')).status).toBe(401);
  });

  it('rejects state-changing admin routes for a normal user', async () => {
    expect((await call('/api/admin/users/x/suspend', 'user', 'POST')).status).toBe(403);
    expect((await call('/api/admin/users/x/grant-admin', 'user', 'POST')).status).toBe(403);
    expect((await call('/api/admin/users/x', 'user', 'DELETE')).status).toBe(403);
  });
});

describe('audit log API', () => {
  it('lets an admin read events, newest first, paginated', async () => {
    const res = await call('/api/admin/audit-logs?page=2&pageSize=10', 'admin');
    expect(res.status).toBe(200);
    const args = prismaMock.auditLog.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.orderBy[0]).toEqual({ createdAt: 'desc' });
  });

  it('caps page size and validates filters', async () => {
    expect((await call('/api/admin/audit-logs?pageSize=500', 'admin')).status).toBe(400);
    expect((await call('/api/admin/audit-logs?outcome=MAYBE', 'admin')).status).toBe(400);
    expect((await call('/api/admin/audit-logs?action=DROP_TABLE', 'admin')).status).toBe(400);
  });

  it('exposes no way to create, edit or delete audit records, even as an admin', async () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      expect((await call('/api/admin/audit-logs', 'admin', method)).status).toBe(404);
      expect((await call('/api/admin/audit-logs/some-id', 'admin', method)).status).toBe(404);
    }
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });
});

describe('admin user list privacy', () => {
  it('selects only minimal fields server-side (username yes; recovery email, tokens, profile no)', async () => {
    const res = await call('/api/admin/users', 'admin');
    expect(res.status).toBe(200);
    const args = prismaMock.user.findMany.mock.calls[0][0];
    expect(args.include).toBeUndefined();
    expect(args.omit).toBeUndefined();
    const selected = Object.keys(args.select);
    for (const forbidden of ['passwordHash', 'recoveryEmail', 'googleId', 'profile', 'refreshTokens', 'chatHistory']) {
      expect(selected).not.toContain(forbidden);
    }
    expect(selected).toEqual(expect.arrayContaining(['id', 'email', 'status', 'createdAt']));
  });

  it('searches by id or username only — never by recovery email or full name', async () => {
    await call('/api/admin/users?search=bob', 'admin');
    const where = prismaMock.user.findMany.mock.calls[0][0].where;
    expect(JSON.stringify(where)).not.toMatch(/recoveryEmail|fullName|profile/);
    expect(JSON.stringify(where)).toMatch(/email/);
  });
});

describe('internal cron endpoint', () => {
  it('rejects requests without the cron secret, including user JWTs', async () => {
    expect((await call('/api/internal/cron/retention')).status).toBe(401);
    expect((await call('/api/internal/cron/retention', 'admin')).status).toBe(401);
  });
});
