import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validators.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validateRequest(registerSchema), authController.register);
authRouter.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
authRouter.post(
  '/change-password',
  requireAuth,
  validateRequest(changePasswordSchema),
  authController.changePassword,
);
authRouter.get('/me', requireAuth, authController.me);
