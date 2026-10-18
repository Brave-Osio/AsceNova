import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, txMock, verifyGoogleIdToken, envMock } = vi.hoisted(() => {
  const model = () => ({ deleteMany: vi.fn().mockResolvedValue({ count: 0 }) });
  const txMock = {
    refreshToken: model(),
    passwordResetToken: model(),
    chatMessage: model(),
    notification: model(),
    goal: model(),
    waterLog: model(),
    weightProgress: model(),
    workoutLog: model(),
    dailyProgress: model(),
    xpHistory: model(),
    rankHistory: model(),
    streakHistory: model(),
    achievementProgress: model(),
    leaderboardEntry: model(),
    userProgress: model(),
    challengeParticipant: model(),
    workoutPlan: model(),
    profile: model(),
    coachAssignment: { updateMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
    $executeRaw: vi.fn().mockResolvedValue(0),
  };
  const prismaMock = {
    user: { findUnique: vi.fn(), count: vi.fn(), findMany: vi.fn() },
    refreshToken: { count: vi.fn(), deleteMany: vi.fn() },
    passwordResetToken: { count: vi.fn(), deleteMany: vi.fn() },
    chatMessage: { count: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  };
  const envMock = {
    NODE_ENV: 'test',
    SOFT_DELETE_RETENTION_DAYS: 30,
    CHAT_RETENTION_DAYS: 90,
    RETENTION_DRY_RUN: true,
    REFRESH_TOKEN_EXPIRES_IN_DAYS: 30,
    BCRYPT_SALT_ROUNDS: 4,
  };
  return { prismaMock, txMock, verifyGoogleIdToken: vi.fn(), envMock };
});

vi.mock('../config/env.js', () => ({ env: envMock }));
vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
vi.mock('../lib/googleAuth.js', () => ({ verifyGoogleIdToken }));
vi.mock('../lib/email.js', () => ({ isEmailConfigured: vi.fn(), sendPasswordResetEmail: vi.fn() }));
vi.mock('../lib/jwt.js', () => ({ signAccessToken: () => 'access' }));
vi.mock('../lib/password.js', () => ({ hashPassword: vi.fn(), comparePassword: vi.fn() }));

const { deleteAccount } = await import('./authService.js');
const { eraseUserData, erasedEmailFor } = await import('./userErasureService.js');
const { runRetentionPurge } = await import('./retentionService.js');
const { comparePassword } = await import('../lib/password.js');

const PERSONAL_MODELS = [
  'refreshToken',
  'passwordResetToken',
  'chatMessage',
  'notification',
  'goal',
  'waterLog',
  'weightProgress',
  'workoutLog',
  'dailyProgress',
  'xpHistory',
  'rankHistory',
  'streakHistory',
  'achievementProgress',
  'leaderboardEntry',
  'userProgress',
  'challengeParticipant',
  'workoutPlan',
  'profile',
] as const;

const account = (o: Record<string, unknown> = {}) => ({
  id: 'u1',
  role: 'USER',
  deleted: false,
  passwordHash: 'hash',
  googleId: null,
  ...o,
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation((fn: (tx: typeof txMock) => unknown) => fn(txMock));
  txMock.user.findUnique.mockResolvedValue({ deletedAt: null });
  vi.mocked(comparePassword).mockResolvedValue(true as never);
});

describe('eraseUserData', () => {
  it('erases every personal table scoped strictly to the one user', async () => {
    await eraseUserData(txMock as never, 'u1');
    for (const name of PERSONAL_MODELS) {
      expect(txMock[name].deleteMany, name).toHaveBeenCalledWith({ where: { userId: 'u1' } });
    }
  });

  it('leaves a PII-free tombstone instead of deleting the user row or shared data', async () => {
    await eraseUserData(txMock as never, 'u1');
    const data = txMock.user.update.mock.calls[0][0].data;
    expect(data).toMatchObject({
      email: erasedEmailFor('u1'),
      passwordHash: null,
      googleId: null,
      recoveryEmail: null,
      status: 'DELETED',
      deleted: true,
      role: 'USER',
    });
    expect(erasedEmailFor('u1')).toMatch(/@deleted\.invalid$/);
    expect(txMock.user).not.toHaveProperty('delete'); // the row (and shared challenge invites it anchors) survives
  });

  it('keeps the original deletedAt when an admin already soft-deleted the account', async () => {
    const earlier = new Date('2026-01-01T00:00:00Z');
    txMock.user.findUnique.mockResolvedValue({ deletedAt: earlier });
    await eraseUserData(txMock as never, 'u1');
    expect(txMock.user.update.mock.calls[0][0].data.deletedAt).toBe(earlier);
  });
});

describe('deleteAccount (self-service)', () => {
  it('requires the correct password and erases nothing otherwise', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account());
    vi.mocked(comparePassword).mockResolvedValue(false as never);

    await expect(deleteAccount('u1', { confirmation: 'DELETE', password: 'wrong' })).rejects.toMatchObject({ status: 401 });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(txMock.profile.deleteMany).not.toHaveBeenCalled();
  });

  it('does not accept a missing password for a password account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account());
    await expect(deleteAccount('u1', { confirmation: 'DELETE', idToken: 'google' })).rejects.toMatchObject({ status: 401 });
    expect(verifyGoogleIdToken).not.toHaveBeenCalled();
  });

  it('only ever acts on the authenticated user id passed in (ownership)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account({ id: 'me' }));
    await deleteAccount('me', { confirmation: 'DELETE', password: 'right' });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 'me' } });
    for (const name of PERSONAL_MODELS) {
      expect(txMock[name].deleteMany).toHaveBeenCalledWith({ where: { userId: 'me' } });
    }
    expect(txMock.user.update.mock.calls[0][0].where).toEqual({ id: 'me' });
  });

  it('revokes sessions by erasing refresh tokens in the same transaction as the account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account());
    await deleteAccount('u1', { confirmation: 'DELETE', password: 'right' });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });

  it('re-authenticates Google-only accounts with a token for the same Google account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account({ passwordHash: null, googleId: 'g-1' }));

    verifyGoogleIdToken.mockResolvedValueOnce({ googleId: 'someone-else', email: 'x@y.z' });
    await expect(deleteAccount('u1', { confirmation: 'DELETE', idToken: 't' })).rejects.toMatchObject({ status: 401 });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();

    verifyGoogleIdToken.mockResolvedValueOnce({ googleId: 'g-1', email: 'x@y.z' });
    await deleteAccount('u1', { confirmation: 'DELETE', idToken: 't' });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it('refuses to delete the only remaining administrator', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account({ role: 'ADMIN' }));
    txMock.user.count.mockResolvedValue(0);
    await expect(deleteAccount('u1', { confirmation: 'DELETE', password: 'right' })).rejects.toMatchObject({ status: 409 });
    expect(txMock.$executeRaw).toHaveBeenCalled(); // admin-removal lock taken before counting
    expect(txMock.profile.deleteMany).not.toHaveBeenCalled();
  });

  it('404s for an already-deleted account', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account({ deleted: true }));
    await expect(deleteAccount('u1', { confirmation: 'DELETE', password: 'right' })).rejects.toMatchObject({ status: 404 });
  });

  it('does not leak internals in the failure message', async () => {
    prismaMock.user.findUnique.mockResolvedValue(account());
    vi.mocked(comparePassword).mockResolvedValue(false as never);
    await expect(deleteAccount('u1', { confirmation: 'DELETE', password: 'x' })).rejects.toThrow(/could not confirm your identity/i);
  });
});

describe('runRetentionPurge', () => {
  beforeEach(() => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 'old-1' }, { id: 'old-2' }]);
    prismaMock.refreshToken.count.mockResolvedValue(5);
    prismaMock.passwordResetToken.count.mockResolvedValue(3);
    prismaMock.chatMessage.count.mockResolvedValue(7);
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 5 });
    prismaMock.passwordResetToken.deleteMany.mockResolvedValue({ count: 3 });
    prismaMock.chatMessage.deleteMany.mockResolvedValue({ count: 7 });
  });

  it('dry run reports counts and deletes nothing', async () => {
    const report = await runRetentionPurge(true);
    expect(report).toEqual({
      dryRun: true,
      softDeletedAccountsErased: 2,
      accountErasureFailures: 0,
      accountsRemaining: 0,
      expiredRefreshTokens: 5,
      usedOrExpiredResetTokens: 3,
      expiredChatMessages: 7,
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.refreshToken.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.chatMessage.deleteMany).not.toHaveBeenCalled();
  });

  it('defaults to the safe dry-run setting from env', async () => {
    await runRetentionPurge();
    expect(prismaMock.chatMessage.deleteMany).not.toHaveBeenCalled();
  });

  it('only selects accounts soft-deleted past the retention window that are not already anonymised', async () => {
    await runRetentionPurge(true);
    const where = prismaMock.user.findMany.mock.calls[0][0].where;
    expect(where.deleted).toBe(true);
    expect(where.deletedAt.lt).toBeInstanceOf(Date);
    expect(where.NOT).toEqual({ email: { endsWith: '@deleted.invalid' } });
  });

  it('one failing account does not abort the run; token and chat cleanup still happens', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    prismaMock.$transaction.mockRejectedValueOnce(new Error('boom')).mockImplementation((fn: (tx: typeof txMock) => unknown) => fn(txMock));
    const report = await runRetentionPurge(false);
    expect(report).toMatchObject({ softDeletedAccountsErased: 1, accountErasureFailures: 1 });
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.chatMessage.deleteMany).toHaveBeenCalledTimes(1);
  });

  it('caps accounts erased per run and reports the remainder', async () => {
    prismaMock.user.findMany.mockResolvedValue(Array.from({ length: 30 }, (_, i) => ({ id: 'u' + i })));
    const report = await runRetentionPurge(true);
    expect(report).toMatchObject({ softDeletedAccountsErased: 25, accountsRemaining: 5 });
  });

  it('live run erases each eligible account and purges old tokens and chat', async () => {
    const report = await runRetentionPurge(false);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(2);
    expect(txMock.user.update.mock.calls.map((c) => c[0].where.id)).toEqual(['old-1', 'old-2']);
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.chatMessage.deleteMany).toHaveBeenCalledTimes(1);
    expect(report).toMatchObject({ dryRun: false, softDeletedAccountsErased: 2, expiredChatMessages: 7 });
  });
});
