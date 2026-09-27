import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { planRouter } from './routes/plan.routes.js';
import { dailyProgressRouter } from './routes/dailyProgress.routes.js';
import { progressRouter } from './routes/progress.routes.js';
import { leaderboardRouter } from './routes/leaderboard.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { notificationRouter } from './routes/notification.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { challengeRouter } from './routes/challenge.routes.js';

export const app = express();

// Deploys behind Vercel's proxy — without this, req.ip reflects the proxy,
// not the real client, making per-IP rate limiting meaningless.
app.set('trust proxy', 1);

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
app.use('/api/plans', planRouter);
app.use('/api/daily-progress', dailyProgressRouter);
app.use('/api/progress', progressRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/challenges', challengeRouter);

// Remaining resource routers are mounted here as each domain is built
// out (goals).

app.use(errorHandler);
