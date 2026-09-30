import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';

const { prismaMock, verifyGoogleIdToken, emailMock, envMock } = vi.hoisted(() => {
  const prismaMock = {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    userProgress: { create: vi.fn() },
    refreshToken: { create: vi.fn(), updateMany: vi.fn() },
    passwordResetToken: { count: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  };
  prismaMock.$transaction.mockImplementation((arg: unknown) =>
    typeof arg === 'function' ? arg(prismaMock) : Promise.all(arg as Promise<unknown>[]),
  );
  const emailMock = { isEmailConfigured: vi.fn(), sendPasswordResetEmail: vi.fn() };
  const envMock = { NODE_ENV: 'test', REFRESH_TOKEN_EXPIRES_IN_DAYS: 30, BCRYPT_SALT_ROUNDS: 4 };
  return { prismaMock, verifyGoogleIdToken: vi.fn(), emailMock, envMock };
});

vi.mock('../config/env.js', () => ({ env: envMock }));
vi.mock('../lib/prismaClient.js', () => ({ prisma: prismaMock }));
vi.mock('../lib/googleAuth.js', () => ({ verifyGoogleIdToken }));
vi.mock('../lib/email.js', () => emailMock);
vi.mock('../lib/jwt.js', () => ({ signAccessToken: () => 'access-token' }));
vi.mock('../lib/password.js', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

const { googleLogin, login, changePassword, forgotPassword, setRecoveryEmail, getMe } = await import('./authService.js');
const { comparePassword } = await import('../lib/password.js');
const { HttpError } = await import('../middleware/errorHandler.js');

type TestUser = {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  recoveryEmail: string | null;
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
    recoveryEmail: null,
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

describe('authService.forgotPassword', () => {
  const request = { email: 'brave', recoveryEmail: 'brave@gmail.com' };
  const accountWithRecovery = () => makeUser({ email: 'brave', recoveryEmail: 'brave@gmail.com' });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    envMock.NODE_ENV = 'test';
    prismaMock.passwordResetToken.count.mockResolvedValue(0);
    prismaMock.passwordResetToken.create.mockResolvedValue({});
    emailMock.isEmailConfigured.mockReturnValue(true);
    emailMock.sendPasswordResetEmail.mockResolvedValue(undefined);
  });

  it('emails the reset link to the saved recovery Gmail and never returns the token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(accountWithRecovery());

    const result = await forgotPassword(request);

    expect(result).toEqual({});
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'brave' } });
    expect(emailMock.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'brave@gmail.com', token: expect.any(String), expiresInMinutes: 60 }),
    );
  });

  it.each([
    ['an unknown username', null],
    ['a soft-deleted account', { ...makeUser({ recoveryEmail: 'brave@gmail.com' }), deleted: true }],
    ['an account with no recovery email saved', makeUser({ recoveryEmail: null })],
    ['a Gmail that differs from the saved one', makeUser({ recoveryEmail: 'someone.else@gmail.com' })],
  ])('rejects %s with the same generic error and sends nothing', async (_label, user) => {
    prismaMock.user.findUnique.mockResolvedValue(user);

    await expect(forgotPassword(request)).rejects.toMatchObject({
      status: 400,
      message: "Username and email don't match our records.",
    });
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(emailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('in production, refuses once the hourly request limit is reached', async () => {
    envMock.NODE_ENV = 'production';
    prismaMock.user.findUnique.mockResolvedValue(accountWithRecovery());
    prismaMock.passwordResetToken.count.mockResolvedValue(3);

    await expect(forgotPassword(request)).rejects.toMatchObject({ status: 429 });
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(emailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('outside production, does not limit reset requests so the flow is easy to test', async () => {
    prismaMock.user.findUnique.mockResolvedValue(accountWithRecovery());
    prismaMock.passwordResetToken.count.mockResolvedValue(50);

    await expect(forgotPassword(request)).resolves.toEqual({});
    expect(emailMock.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it('tells the user when delivery fails instead of pretending it worked', async () => {
    prismaMock.user.findUnique.mockResolvedValue(accountWithRecovery());
    emailMock.sendPasswordResetEmail.mockRejectedValue(new Error('SMTP down'));

    await expect(forgotPassword(request)).rejects.toMatchObject({ status: 502 });
  });

  it('returns the dev token outside production when email is not configured', async () => {
    prismaMock.user.findUnique.mockResolvedValue(accountWithRecovery());
    emailMock.isEmailConfigured.mockReturnValue(false);

    const result = await forgotPassword(request);

    expect(result).toEqual({ devResetToken: expect.any(String) });
    expect(emailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('never returns the token in production — it fails with 503 when email is not configured', async () => {
    envMock.NODE_ENV = 'production';
    prismaMock.user.findUnique.mockResolvedValue(accountWithRecovery());
    emailMock.isEmailConfigured.mockReturnValue(false);

    await expect(forgotPassword(request)).rejects.toMatchObject({ status: 503 });
  });
});

describe('authService.setRecoveryEmail', () => {
  const input = { currentPassword: 'current-pass', recoveryEmail: 'new.me@gmail.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(comparePassword).mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({});
  });

  it('saves the recovery email after the current password checks out and returns it masked', async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser());

    const result = await setRecoveryEmail('user-1', input);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { recoveryEmail: 'new.me@gmail.com' },
    });
    expect(result).toEqual({ recoveryEmailMasked: 'n***@gmail.com' });
  });

  it('rejects a wrong current password without changing anything', async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser());
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(setRecoveryEmail('user-1', input)).rejects.toMatchObject({ status: 401 });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('rejects Google-only accounts, which have no password to confirm with', async () => {
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ passwordHash: null, googleId: 'g-1' }));

    await expect(setRecoveryEmail('user-1', input)).rejects.toMatchObject({ status: 400 });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});

describe('authService.getMe', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exposes only a masked recovery email and whether a password exists, never the hashes', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...makeUser({ recoveryEmail: 'bravejohn@gmail.com' }),
      createdAt: new Date(),
    });

    const me = await getMe('user-1');

    expect(me).toMatchObject({ hasPassword: true, recoveryEmailMasked: 'b***@gmail.com' });
    expect(me).not.toHaveProperty('passwordHash');
    expect(me).not.toHaveProperty('recoveryEmail');
  });

  it('reports no recovery email when none is saved', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...makeUser(), createdAt: new Date() });

    const me = await getMe('user-1');

    expect(me.recoveryEmailMasked).toBeNull();
  });
});
