import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.fn();

vi.mock('../config/env.js', () => ({
  env: { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'test-model' },
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const { generateCoachReply } = await import('./gemini.js');

class UpstreamError extends Error {
  constructor(public status: number) {
    super(`upstream ${status}`);
  }
}

async function runReply() {
  const promise = generateCoachReply('system', [], 'hi');
  // Attach the assertion target before timers fire to avoid unhandled rejections.
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await vi.runAllTimersAsync();
  return settled;
}

describe('generateCoachReply', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    generateContent.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries a 503 and returns the reply once Gemini recovers', async () => {
    generateContent.mockRejectedValueOnce(new UpstreamError(503)).mockResolvedValueOnce({ text: 'hello' });

    const result = await runReply();

    expect(result).toEqual({ value: 'hello' });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('gives up after 3 attempts on repeated 503s with a specific message', async () => {
    generateContent.mockRejectedValue(new UpstreamError(503));

    const result = await runReply();

    expect(generateContent).toHaveBeenCalledTimes(3);
    expect(result).toMatchObject({ error: { status: 503, message: expect.stringContaining('busy') } });
  });

  it('does not retry a 429 and reports the usage limit', async () => {
    generateContent.mockRejectedValue(new UpstreamError(429));

    const result = await runReply();

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ error: { status: 429, message: expect.stringContaining('usage limit') } });
  });

  it('does not retry other failures and falls back to the generic 502', async () => {
    generateContent.mockRejectedValue(new UpstreamError(500));

    const result = await runReply();

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ error: { status: 502 } });
  });
});
