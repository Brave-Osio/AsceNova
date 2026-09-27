import { AxiosError } from 'axios';

/** Mirrors the web app's src/lib/errors.ts. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
