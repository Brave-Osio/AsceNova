import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const { prismaMock, verifyGoogleIdToken } = vi.hoisted(() => {
  const prismaMock = {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    userProgress: { create: vi.fn() },
    refreshToken: { create: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn(),
  };
  prismaMock.$transaction.mockImplementation((arg: unknown) =>
    typeof arg === 'function' ? arg(prismaMock) : Promise.all(arg as Promise<unknown>[]),
  );
  return { prismaMock, verifyGoogleIdToken: vi.fn() };
});

vi.mock('../config/env.js', () => ({
  env: { NODE_ENV: 'test', REFRESH_TOKEN_EXPIRES_IN_DAYS: 30, BCRYPT_SALT_ROUNDS: 4 },
}));
vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
vi.mock('../lib/googleAuth.js', () => ({ verifyGoogleIdToken }));
vi.mock('../lib/jwt.js', () => ({ signAccessToken: () => 'access-token' }));
vi.mock('../lib/password.js', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

const { googleLogin, login, changePassword } = await import('./authService.js');
const { HttpError } = await import('../middleware/errorHandler.js');

type TestUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  emailVerifiedAt: Date | null;
  deleted: boolean;
};

function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'user-1',
    email: 'a@example.com',
    passwordHash: 'hash',
    googleId: null,
    role: 'USER',
    status: 'ACTIVE',
    emailVerifiedAt: null,
    deleted: false,
    ...overrides,
  };
}

const meta = { ip: '127.0.0.1', userAgent: 'vitest' };
const googleInput = { idToken: 'token', rememberMe: false };

describe('authService.googleLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyGoogleIdToken.mockResolvedValue({ googleId: 'g-1', email: 'a@example.com' });
    prismaMock.refreshToken.create.mockResolvedValue({});
  });

  it('creates a new verified user with a progress row when nothing matches', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(makeUser({ passwordHash: null, googleId: 'g-1' }));

    const result = await googleLogin(googleInput, meta);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: 'a@example.com', googleId: 'g-1', emailVerifiedAt: expect.any(Date) }),
    });
    expect(prismaMock.userProgress.create).toHaveBeenCalledWith({ data: { userId: 'user-1' } });
    expect(result).toMatchObject({
      userId: 'user-1',
      email: 'a@example.com',
      accessToken: 'access-token',
      hasPassword: false,
      isNewUser: true,
    });
  });

  it('signs in a known googleId without touching the email lookup or creating anything', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(makeUser({ googleId: 'g-1' }));

    await googleLogin(googleInput, meta);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('flags a returning Google user as not new', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(makeUser({ googleId: 'g-1' }));

    const result = await googleLogin(googleInput, meta);

    expect(result.isNewUser).toBe(false);
  });

  it('auto-links an existing password account with the same verified email and revokes its sessions', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(makeUser());
    prismaMock.user.update.mockResolvedValue(makeUser({ googleId: 'g-1' }));

    const result = await googleLogin(googleInput, meta);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { googleId: 'g-1', emailVerifiedAt: expect.any(Date) },
    });
    expect(prismaMock.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(result.userId).toBe('user-1');
  });

  it('refuses to re-point an email that is already linked to a different Google account', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeUser({ googleId: 'someone-else' }));

    await expect(googleLogin(googleInput, meta)).rejects.toMatchObject({ status: 409 });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects a suspended account, including one found only by email', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(makeUser({ status: 'SUSPENDED' }));

    await expect(googleLogin(googleInput, meta)).rejects.toMatchObject({ status: 403 });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects a soft-deleted account', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(makeUser({ googleId: 'g-1', deleted: true }));

    await expect(googleLogin(googleInput, meta)).rejects.toMatchObject({ status: 401 });
    expect(prismaMock.refreshToken.create).not.toHaveBeenCalled();
  });

  it('does not touch the database when the Google token is invalid', async () => {
    verifyGoogleIdToken.mockRejectedValue(new HttpError(401, 'Invalid Google credential'));

    await expect(googleLogin(googleInput, meta)).rejects.toMatchObject({ status: 401 });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('falls back to the winning row when two first sign-ins race on the unique constraint', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' }),
    );
    prismaMock.user.findFirst.mockResolvedValue(makeUser({ googleId: 'g-1' }));

    const result = await googleLogin(googleInput, meta);

    expect(result.userId).toBe('user-1');
  });
});

describe('authService password paths for Google-only accounts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('login() gives the generic invalid-credentials error when the account has no password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ passwordHash: null, googleId: 'g-1' }));

    await expect(login({ email: 'a@example.com', password: 'whatever1', rememberMe: false }, meta)).rejects.toMatchObject({
      status: 401,
      message: 'Invalid email or password',
    });
  });

  it('changePassword() explains that a Google-only account has no current password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ passwordHash: null, googleId: 'g-1' }));

    await expect(
      changePassword('user-1', { currentPassword: 'x', newPassword: 'newpassword1' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
