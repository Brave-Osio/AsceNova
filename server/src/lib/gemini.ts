import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw new HttpError(503, 'AI features are not configured');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
}

export interface CoachTurn {
  role: 'user' | 'model';
  text: string;
}

// Hard cap on Gemini calls per coach message (first try + retries) — the API
// key's quota is small, so never loop beyond this. Fits Vercel Hobby's 10s limit.
const MAX_COACH_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];

function getUpstreamStatus(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const { status } = err as { status: unknown };
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

/**
 * Retries only on 503 (model overloaded — transient). 429 (quota exhausted)
 * and everything else fail immediately so we don't burn more of the quota.
 */
async function withOverloadRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (getUpstreamStatus(err) !== 503 || attempt >= MAX_COACH_ATTEMPTS) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]));
    }
  }
}

function toCoachHttpError(err: unknown): HttpError {
  switch (getUpstreamStatus(err)) {
    case 503:
      return new HttpError(503, 'The AI coach is busy right now. Please try again in a moment.');
    case 429:
      return new HttpError(429, 'AI usage limit reached. Please try again later.');
    default:
      return new HttpError(502, 'AI coach is temporarily unavailable — please try again');
  }
}

/**
 * Thin wrapper over the Gemini SDK — the one seam chatService talks to,
 * so the prompt-building/persistence logic never touches the SDK shape
 * directly. Throws HttpError(503) if unconfigured and HttpError(502) on
 * any request failure — no silent fallback to a canned reply.
 */
export async function generateCoachReply(
  systemPrompt: string,
  history: CoachTurn[],
  userMessage: string,
): Promise<string> {
  const ai = getClient();

  try {
    const response = await withOverloadRetry(() =>
      ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [
          ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
          { role: 'user' as const, parts: [{ text: userMessage }] },
        ],
        config: {
          systemInstruction: systemPrompt,
        },
      }),
    );

    const text = response.text;
    if (!text) {
      throw new HttpError(502, 'AI coach is temporarily unavailable — please try again');
    }
    return text;
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    console.error('Gemini request failed:', err);
    throw toCoachHttpError(err);
  }
}

/**
 * For callers that need structured (JSON) output instead of free-form
 * text, e.g. workoutGenerationService. Validate the parsed result against
 * your own schema before trusting it — `responseSchema` constrains the
 * model's output but is not a substitute for real validation.
 */
export async function generateStructuredContent<T>(prompt: string, responseSchema: object): Promise<T> {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new HttpError(502, 'AI generation is temporarily unavailable — please try again');
    }
    return JSON.parse(text) as T;
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    console.error('Gemini structured request failed:', err);
    throw new HttpError(502, 'AI generation is temporarily unavailable — please try again');
  }
}
