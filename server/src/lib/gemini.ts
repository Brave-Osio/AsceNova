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
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [
        ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        { role: 'user' as const, parts: [{ text: userMessage }] },
      ],
      config: {
        systemInstruction: systemPrompt,
      },
    });

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
    throw new HttpError(502, 'AI coach is temporarily unavailable — please try again');
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
