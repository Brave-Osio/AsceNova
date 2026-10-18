import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock } = vi.hoisted(() => {
  const txMock = {
    auditLog: { create: vi.fn() },
    user: { findFirst: vi.fn(), update: vi.fn() },
    coachAssignment: { updateMany: vi.fn(), upsert: vi.fn() },
    $executeRaw: vi.fn().mockResolvedValue(0),
  };
  const prismaMock = { auditLog: { create: vi.fn() }, $transaction: vi.fn() };
  return { prismaMock, txMock };
});

vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));

const adminService = await import('./adminService.js');

const ctx = { actorId: 'admin-1', requestId: 'req-12345678' };
const account = (id: string, role: 'USER' | 'COACH' | 'ADMIN', status = 'ACTIVE') => ({
  id,
  email: `${id}@example.com`,
  role,
  status,
  createdAt: new Date(),
});

function target(...accounts: ReturnType<typeof account>[]) {
  txMock.user.findFirst.mockImplementation(async ({ where }: { where: { id: string } }) => accounts.find((a) => a.id === where.id) ?? null);
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation((fn: (tx: typeof txMock) => unknown) => fn(txMock));
  txMock.user.update.mockImplementation(async ({ data }: { data: object }) => ({ ...data }));
  txMock.coachAssignment.updateMany.mockResolvedValue({ count: 1 });
});

describe('granting the coach role', () => {
  it('promotes a regular user and audits USER_GRANT_COACH', async () => {
    target(account('u1', 'USER'));
    await adminService.setUserRole(ctx, 'u1', 'COACH');
    expect(txMock.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { role: 'COACH' } }));
    expect(txMock.auditLog.create.mock.calls[0][0].data).toMatchObject({ action: 'USER_GRANT_COACH', outcome: 'SUCCESS', targetId: 'u1' });
  });

  it('refuses to turn an administrator into a coach', async () => {
    target(account('a2', 'ADMIN'));
    await expect(adminService.setUserRole(ctx, 'a2', 'COACH')).rejects.toMatchObject({ status: 409 });
    expect(txMock.user.update).not.toHaveBeenCalled();
  });

  it('refuses a suspended account and your own account', async () => {
    target(account('u1', 'USER', 'SUSPENDED'));
    await expect(adminService.setUserRole(ctx, 'u1', 'COACH')).rejects.toMatchObject({ status: 400 });
    await expect(adminService.setUserRole(ctx, 'admin-1', 'COACH')).rejects.toMatchObject({ status: 400 });
  });
});

describe('revoking roles', () => {
  it('revoking coach demotes to USER and deactivates every client assignment', async () => {
    target(account('c1', 'COACH'));
    await adminService.revokeCoach(ctx, 'c1');
    expect(txMock.coachAssignment.updateMany).toHaveBeenCalledWith({ where: { coachId: 'c1', active: true }, data: { active: false } });
    expect(txMock.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { role: 'USER' } }));
    expect(txMock.auditLog.create.mock.calls[0][0].data.action).toBe('USER_REVOKE_COACH');
  });

  it('revoke-coach on a non-coach is a 409', async () => {
    target(account('u1', 'USER'));
    await expect(adminService.revokeCoach(ctx, 'u1')).rejects.toMatchObject({ status: 409 });
  });

  it('revoke-admin cannot be used to strip a coach (or anyone who is not an admin)', async () => {
    target(account('c1', 'COACH'));
    await expect(adminService.setUserRole(ctx, 'c1', 'USER')).rejects.toMatchObject({ status: 409 });
    expect(txMock.user.update).not.toHaveBeenCalled();
  });

  it('promoting a coach to admin ends their supervision', async () => {
    target(account('c1', 'COACH'));
    await adminService.setUserRole(ctx, 'c1', 'ADMIN');
    expect(txMock.coachAssignment.updateMany).toHaveBeenCalledWith({ where: { coachId: 'c1', active: true }, data: { active: false } });
  });
});

describe('client assignment', () => {
  it('assigns a regular user to a coach (moving any existing assignment) and audits it', async () => {
    target(account('c1', 'COACH'), account('u1', 'USER'));
    txMock.coachAssignment.upsert.mockResolvedValue({ coachId: 'c1', clientId: 'u1', active: true });
    await adminService.assignClient(ctx, 'c1', 'u1');
    expect(txMock.coachAssignment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clientId: 'u1' },
        create: { coachId: 'c1', clientId: 'u1', assignedById: 'admin-1' },
        update: { coachId: 'c1', active: true, assignedById: 'admin-1' },
      }),
    );
    expect(txMock.auditLog.create.mock.calls[0][0].data).toMatchObject({ action: 'COACH_ASSIGN_CLIENT', targetId: 'u1' });
  });

  it('only accepts a real coach and a regular-user client', async () => {
    target(account('u9', 'USER'), account('u1', 'USER'), account('c1', 'COACH'), account('a1', 'ADMIN'), account('c2', 'COACH'));
    await expect(adminService.assignClient(ctx, 'u9', 'u1')).rejects.toMatchObject({ status: 400 });
    await expect(adminService.assignClient(ctx, 'c1', 'a1')).rejects.toMatchObject({ status: 400 });
    await expect(adminService.assignClient(ctx, 'c1', 'c2')).rejects.toMatchObject({ status: 400 });
    expect(txMock.coachAssignment.upsert).not.toHaveBeenCalled();
  });

  it('unassigning is a soft removal (active = false), never a delete', async () => {
    await adminService.unassignClient(ctx, 'c1', 'u1');
    expect(txMock.coachAssignment.updateMany).toHaveBeenCalledWith({ where: { coachId: 'c1', clientId: 'u1', active: true }, data: { active: false } });
    expect(txMock.auditLog.create.mock.calls[0][0].data.action).toBe('COACH_UNASSIGN_CLIENT');
  });

  it('unassigning a client who is not assigned is a 404', async () => {
    txMock.coachAssignment.updateMany.mockResolvedValue({ count: 0 });
    await expect(adminService.unassignClient(ctx, 'c1', 'u1')).rejects.toMatchObject({ status: 404 });
  });
});
