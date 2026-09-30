import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prismaClient.js';
import { hashPassword, comparePassword } from '../lib/password.js';
import { signAccessToken } from '../lib/jwt.js';
import { generateOpaqueToken, sha256Hex } from '../lib/crypto.js';
import { verifyGoogleIdToken } from '../lib/googleAuth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type {
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validators/auth.validators.js';

interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function issueTokenPair(
  userId: string,
  role: 'USER' | 'ADMIN',
  rememberMe: boolean,
  meta: RequestMeta,
): Promise<TokenPair> {
  const accessToken = signAccessToken({ sub: userId, role });

  const rawRefreshToken = generateOpaqueToken();
  const days = rememberMe ? env.REFRESH_TOKEN_EXPIRES_IN_DAYS : 1;
  const refreshExpiresAt = new Date(Date.now() + days * MS_PER_DAY);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256Hex(rawRefreshToken),
      expiresAt: refreshExpiresAt,
      createdByIp: meta.ip,
      userAgent: meta.userAgent,
    },
  });

  return { accessToken, refreshToken: rawRefreshToken, refreshExpiresAt };
}

/** Every new account — password or Google — needs its UserProgress row created atomically with it. */
function createUserWithProgress(data: Prisma.UserCreateInput) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data });
    await tx.userProgress.create({ data: { userId: created.id } });
    return created;
  });
}

export async function register(input: RegisterInput, meta: RequestMeta): Promise<TokenPair & { userId: string }> {
  const passwordHash = await hashPassword(input.password);

  const user = await createUserWithProgress({ email: input.email, passwordHash });

  const tokens = await issueTokenPair(user.id, user.role, false, meta);
  return { ...tokens, userId: user.id };
}

export async function login(
  input: LoginInput,
  meta: RequestMeta,
): Promise<TokenPair & { userId: string; role: 'USER' | 'ADMIN' }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || user.deleted) {
    throw new HttpError(401, 'Invalid email or password');
  }
  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'This account has been suspended');
  }

  // Google-only accounts have no password — same generic error as a wrong one,
  // so this endpoint can't be used to tell which sign-in method an email uses.
  if (!user.passwordHash) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const tokens = await issueTokenPair(user.id, user.role, input.rememberMe, meta);
  return { ...tokens, userId: user.id, role: user.role };
}

/**
 * Signs in (or signs up) with a Google ID token. Resolution order: known googleId,
 * then an existing account with the same Google-verified email (auto-linked, and
 * its other sessions revoked), else a brand-new account.
 */
export async function googleLogin(
  input: GoogleLoginInput,
  meta: RequestMeta,
): Promise<
  TokenPair & { userId: string; email: string; role: 'USER' | 'ADMIN'; hasPassword: boolean; isNewUser: boolean }
> {
  const { googleId, email } = await verifyGoogleIdToken(input.idToken);

  let isNewUser = false;
  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email } });

    if (byEmail) {
      if (byEmail.deleted) {
        throw new HttpError(401, 'Unable to sign in with Google');
      }
      if (byEmail.status !== 'ACTIVE') {
        throw new HttpError(403, 'This account has been suspended');
      }
      if (byEmail.googleId) {
        // Same email, but already tied to a different Google account — never re-point it.
        throw new HttpError(409, 'This email is already linked to a different Google account');
      }
      const [linked] = await prisma.$transaction([
        prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId, emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date() },
        }),
        // The account may have been registered by someone else who never proved they own
        // this email (registration doesn't verify it) — end any pre-existing sessions.
        prisma.refreshToken.updateMany({
          where: { userId: byEmail.id, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);
      user = linked;
    } else {
      try {
        user = await createUserWithProgress({ email, googleId, emailVerifiedAt: new Date() });
        isNewUser = true;
      } catch (err) {
        // Two concurrent first-time sign-ins raced; the other request won — use its row.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });
        }
        if (!user) {
          throw err;
        }
      }
    }
  }

  if (user.deleted) {
    throw new HttpError(401, 'Unable to sign in with Google');
  }
  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'This account has been suspended');
  }

  const tokens = await issueTokenPair(user.id, user.role, input.rememberMe, meta);
  return {
    ...tokens,
    userId: user.id,
    email: user.email,
    role: user.role,
    hasPassword: user.passwordHash !== null,
    isNewUser,
  };
}

export async function refresh(rawRefreshToken: string, meta: RequestMeta): Promise<TokenPair> {
  const tokenHash = sha256Hex(rawRefreshToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!existing) {
    throw new HttpError(401, 'Invalid refresh token');
  }

  if (existing.revokedAt) {
    // Replay of an already-used token — possible theft. Revoke every
    // active refresh token for this user defensively.
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new HttpError(401, 'Refresh token has already been used');
  }

  if (existing.expiresAt < new Date()) {
    throw new HttpError(401, 'Refresh token has expired');
  }

  if (existing.user.status !== 'ACTIVE' || existing.user.deleted) {
    throw new HttpError(403, 'This account is no longer active');
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const rememberMe = existing.expiresAt.getTime() - existing.createdAt.getTime() > MS_PER_DAY;
  return issueTokenPair(existing.userId, existing.user.role, rememberMe, meta);
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = sha256Hex(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, status: true, createdAt: true, passwordHash: true },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  // Expose only whether a password exists (Google-only accounts have none), never the hash.
  const { passwordHash, ...rest } = user;
  return { ...rest, hasPassword: passwordHash !== null };
}

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function forgotPassword(email: string): Promise<{ devResetToken?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same whether or not the email exists, so this
  // endpoint can't be used to enumerate registered accounts.
  if (!user || user.deleted) {
    return {};
  }

  const rawToken = generateOpaqueToken(32);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(rawToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
    },
  });

  // No transactional email provider is wired up yet. In non-production
  // environments only, surface the raw token so the reset flow is
  // testable end-to-end; production must not do this until real email
  // delivery exists.
  if (env.NODE_ENV !== 'production') {
    return { devResetToken: rawToken };
  }
  return {};
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if (!user.passwordHash) {
    throw new HttpError(
      400,
      'This account signs in with Google and has no password yet. Use "Forgot password" to set one.',
    );
  }

  const valid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Current password is incorrect');
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    // Force re-login on every device, same as a token-based reset.
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const tokenHash = sha256Hex(input.token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new HttpError(400, 'This reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Force re-login on every device after a password reset.
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
