import { prisma } from '../lib/prismaClient.js';
import { env } from '../config/env.js';

/**
 * Gemini token usage, one SystemSetting row per UTC day (key `ai_usage:YYYY-MM-DD`).
 * Reuses the existing key/value table on purpose — no schema migration needed.
 * Counters are read-modify-write, so two simultaneous calls can rarely drop an
 * increment; that's an acceptable trade-off for a monitoring graph.
 */
const KEY_PREFIX = 'ai_usage:';

type DayUsage = {
  calls: number;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
};

const EMPTY: DayUsage = { calls: 0, promptTokens: 0, outputTokens: 0, totalTokens: 0 };

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function readUsage(value: unknown): DayUsage {
  if (typeof value !== 'object' || value === null) return { ...EMPTY };
  const v = value as Partial<Record<keyof DayUsage, unknown>>;
  const n = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
  return { calls: n(v.calls), promptTokens: n(v.promptTokens), outputTokens: n(v.outputTokens), totalTokens: n(v.totalTokens) };
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

/** Never throws — usage tracking must not break the AI request that triggered it. */
export async function recordAiUsage(meta: GeminiUsageMetadata | undefined): Promise<void> {
  try {
    const key = `${KEY_PREFIX}${dayKey(new Date())}`;
    const prompt = meta?.promptTokenCount ?? 0;
    const output = meta?.candidatesTokenCount ?? 0;
    const total = meta?.totalTokenCount ?? prompt + output;

    await prisma.$transaction(async (tx) => {
      const row = await tx.systemSetting.findUnique({ where: { key } });
      const current = readUsage(row?.value);
      const next: DayUsage = {
        calls: current.calls + 1,
        promptTokens: current.promptTokens + prompt,
        outputTokens: current.outputTokens + output,
        totalTokens: current.totalTokens + total,
      };
      await tx.systemSetting.upsert({
        where: { key },
        create: { key, value: next, description: 'Gemini token usage for one UTC day' },
        update: { value: next },
      });
    });
  } catch (err) {
    console.error('Failed to record AI usage:', err);
  }
}

export async function getAiUsage(days = 14) {
  const today = new Date(`${dayKey(new Date())}T00:00:00Z`);
  const dates = Array.from({ length: days }, (_, i) => dayKey(new Date(today.getTime() - (days - 1 - i) * 86_400_000)));

  const rows = await prisma.systemSetting.findMany({ where: { key: { in: dates.map((d) => `${KEY_PREFIX}${d}`) } } });
  const byKey = new Map(rows.map((r) => [r.key, readUsage(r.value)]));

  const series = dates.map((date) => ({ date, ...(byKey.get(`${KEY_PREFIX}${date}`) ?? EMPTY) }));
  const todayUsage = series[series.length - 1];

  return {
    model: env.GEMINI_MODEL,
    configured: Boolean(env.GEMINI_API_KEY),
    dailyLimit: env.GEMINI_DAILY_REQUEST_LIMIT ?? null,
    todayTokens: todayUsage.totalTokens,
    todayCalls: todayUsage.calls,
    series,
  };
}
