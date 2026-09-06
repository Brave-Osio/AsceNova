import { prisma } from '../lib/prismaClient.js';
import { hashPassword, comparePassword } from '../lib/password.js';
import { signAccessToken } from '../lib/jwt.js';
import { generateOpaqueToken, sha256Hex } from '../lib/crypto.js';
import { HttpError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { RegisterInput, LoginInput, ResetPasswordInput } from '../validators/auth.validators.js';

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

export async function register(input: RegisterInput, meta: RequestMeta): Promise<TokenPair & { userId: string }> {
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email: input.email, passwordHash },
    });
    await tx.userProgress.create({ data: { userId: created.id } });
    return created;
  });

  const tokens = await issueTokenPair(user.id, user.role, false, meta);
  return { ...tokens, userId: user.id };
}

export async function login(input: LoginInput, meta: RequestMeta): Promise<TokenPair & { userId: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || user.deleted) {
    throw new HttpError(401, 'Invalid email or password');
  }
  if (user.status !== 'ACTIVE') {
    throw new HttpError(403, 'This account has been suspended');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const tokens = await issueTokenPair(user.id, user.role, input.rememberMe, meta);
  return { ...tokens, userId: user.id };
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
    select: { id: true, email: true, role: true, status: true, createdAt: true },
  });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return user;
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
