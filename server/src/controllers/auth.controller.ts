import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import * as authService from '../services/authService.js';
import { HttpError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type {
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validators/auth.validators.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';

function requestMeta(req: Request) {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as RegisterInput;
    const { accessToken, refreshToken, refreshExpiresAt, userId } = await authService.register(
      input,
      requestMeta(req),
    );
    setRefreshCookie(res, refreshToken, refreshExpiresAt);
    // refreshToken is also returned in the body for non-browser clients (mobile) that
    // can't rely on an httpOnly cookie surviving app restarts — see docs/ROADMAP.md Phase 10.
    res
      .status(201)
      .json({ user: { id: userId, email: input.email, role: 'USER', hasPassword: true }, accessToken, refreshToken });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      next(new HttpError(409, 'An account with this email already exists.'));
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as LoginInput;
    const { accessToken, refreshToken, refreshExpiresAt, userId, role } = await authService.login(
      input,
      requestMeta(req),
    );
    setRefreshCookie(res, refreshToken, refreshExpiresAt);
    res.json({ user: { id: userId, email: input.email, role, hasPassword: true }, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as GoogleLoginInput;
    const { accessToken, refreshToken, refreshExpiresAt, userId, email, role, hasPassword, isNewUser } =
      await authService.googleLogin(input, requestMeta(req));
    setRefreshCookie(res, refreshToken, refreshExpiresAt);
    res.json({ user: { id: userId, email, role, hasPassword }, isNewUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    // Browser clients rely on the httpOnly cookie; mobile has no persistent cookie
    // jar across app restarts, so it stores the token itself and sends it explicitly.
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;
    if (!raw) {
      throw new HttpError(401, 'No refresh token provided');
    }
    const { accessToken, refreshToken, refreshExpiresAt } = await authService.refresh(raw, requestMeta(req));
    setRefreshCookie(res, refreshToken, refreshExpiresAt);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] ?? req.body?.refreshToken;
    if (raw) {
      await authService.logout(raw);
    }
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as ForgotPasswordInput;
    const result = await authService.forgotPassword(input.email);
    res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as ResetPasswordInput;
    await authService.resetPassword(input);
    res.json({ message: 'Password has been reset. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as ChangePasswordInput;
    await authService.changePassword(req.user!.id, input);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}
