import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { profileRouter } from './routes/profile.routes.js';

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true, // required so the httpOnly refresh-token cookie is sent/received
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

// Remaining resource routers are mounted here as each domain is built
// out (workout-plans, daily-progress, gamification, leaderboard, chat,
// goals, notifications, admin).

app.use(errorHandler);
