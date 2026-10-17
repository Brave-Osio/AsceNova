import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock } = vi.hoisted(() => {
  const txMock = { auditLog: { create: vi.fn() }, user: { update: vi.fn() } };
  const prismaMock = {
    auditLog: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    user: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn(),
  };
  return { prismaMock, txMock };
});

vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));

const { withAudit, record, listAuditLogs } = await import('./auditService.js');

const ctx = { actorId: 'admin-1', requestId: 'req-12345678' };
const meta = { action: 'USER_SUSPEND' as const, targetType: 'USER', targetId: 'u-1', description: 'Suspended a user account' };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation((fn: (tx: typeof txMock) => unknown) => fn(txMock));
});

describe('withAudit', () => {
  it('writes the SUCCESS audit row in the same transaction as the change', async () => {
    txMock.user.update.mockResolvedValue({ id: 'u-1' });

    const result = await withAudit(ctx, meta, (tx) => tx.user.update({ where: { id: 'u-1' }, data: {} }) as Promise<unknown>);

    expect(result).toEqual({ id: 'u-1' });
    expect(txMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(txMock.auditLog.create.mock.calls[0][0].data).toMatchObject({
      actorId: 'admin-1',
      action: 'USER_SUSPEND',
      targetType: 'USER',
      targetId: 'u-1',
      outcome: 'SUCCESS',
      requestId: 'req-12345678',
    });
    expect(prismaMock.auditLog.create).not.toHaveBeenCalled();
  });

  it('records a FAILURE row outside the rolled-back transaction and rethrows', async () => {
    const boom = new Error('target not found');

    await expect(
      withAudit(ctx, meta, async () => {
        throw boom;
      }),
    ).rejects.toBe(boom);

    expect(txMock.auditLog.create).not.toHaveBeenCalled(); // no SUCCESS row for a failed action
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    const data = prismaMock.auditLog.create.mock.calls[0][0].data;
    expect(data.outcome).toBe('FAILURE');
    expect(data.description).toBe('Failed: Suspended a user account');
    expect(JSON.stringify(data)).not.toContain('target not found'); // error text is never persisted
  });

  it('does not mask the original error if recording the failure also fails', async () => {
    const boom = new Error('original');
    prismaMock.auditLog.create.mockRejectedValueOnce(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      withAudit(ctx, meta, async () => {
        throw boom;
      }),
    ).rejects.toBe(boom);
  });

  it('rolls back the change when the audit write fails (no unaudited admin action)', async () => {
    txMock.user.update.mockResolvedValue({ id: 'u-1' });
    txMock.auditLog.create.mockRejectedValueOnce(new Error('audit insert failed'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(withAudit(ctx, meta, (tx) => tx.user.update({ where: { id: 'u-1' }, data: {} }) as Promise<unknown>)).rejects.toThrow(
      'audit insert failed',
    );
  });
});

describe('record', () => {
  it('truncates over-long descriptions', async () => {
    await record({ actorId: 'a', action: 'ADMIN_LOGIN', outcome: 'SUCCESS', description: 'x'.repeat(1000) });
    expect(prismaMock.auditLog.create.mock.calls[0][0].data.description).toHaveLength(300);
  });
});

describe('listAuditLogs', () => {
  it('filters by actor, action, outcome and UTC date range, newest first', async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 'a' }]);
    prismaMock.auditLog.findMany.mockResolvedValue([]);
    prismaMock.auditLog.count.mockResolvedValue(0);
    const from = new Date('2026-10-01T00:00:00Z');
    const to = new Date('2026-10-02T00:00:00Z');

    await listAuditLogs({ actor: 'a', action: 'USER_DELETE', outcome: 'FAILURE', from, to, page: 3, pageSize: 25 });

    const args = prismaMock.auditLog.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ actorId: { in: ['a'] }, action: 'USER_DELETE', outcome: 'FAILURE', createdAt: { gte: from, lte: to } });
    expect(args.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(args.skip).toBe(50);
    expect(args.take).toBe(25);
  });

  it('returns timestamps as ISO (UTC) strings', async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([
      { id: '1', createdAt: new Date('2026-10-01T05:06:07Z'), actorId: 'a1', targetType: null, targetId: null },
    ]);
    prismaMock.auditLog.count.mockResolvedValue(1);
    prismaMock.user.findMany.mockResolvedValue([]);
    const out = await listAuditLogs({ page: 1, pageSize: 10 });
    expect(out.events[0].createdAt).toBe('2026-10-01T05:06:07.000Z');
  });

  it('resolves actor and target usernames at read time; erased accounts show null', async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([
      { id: '1', createdAt: new Date(), actorId: 'admin-1', targetType: 'USER', targetId: 'gone' },
      { id: '2', createdAt: new Date(), actorId: 'admin-1', targetType: 'ACHIEVEMENT', targetId: 'ach' },
    ]);
    prismaMock.auditLog.count.mockResolvedValue(2);
    prismaMock.user.findMany.mockResolvedValue([
      { id: 'admin-1', email: 'boss' },
      { id: 'gone', email: 'deleted-gone@deleted.invalid' },
    ]);
    const out = await listAuditLogs({ page: 1, pageSize: 10 });
    expect(out.events[0]).toMatchObject({ actorUsername: 'boss', targetUsername: null });
    expect(out.events[1]).toMatchObject({ actorUsername: 'boss', targetUsername: null });
    expect(prismaMock.user.findMany.mock.calls.at(-1)?.[0].where.id.in.sort()).toEqual(['admin-1', 'gone']);
  });
});
