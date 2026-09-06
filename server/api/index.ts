import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/app.js';

/**
 * Vercel serverless entry point. Vercel invokes this file's default
 * export for every request (see ../vercel.json's catch-all rewrite);
 * the Express app itself still does the real routing based on the
 * original req.url, so no route logic lives here.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}
