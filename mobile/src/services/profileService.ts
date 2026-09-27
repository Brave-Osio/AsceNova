import { AxiosError } from 'axios';
import { httpClient } from '../lib/httpClient';
import type { Profile, ProfileInput } from '../types/profile.types';

/** Mirrors the web app's src/services/profileService.ts. */
export async function getMyProfile(): Promise<Profile | null> {
  try {
    const res = await httpClient.get<{ profile: Profile }>('/api/profile');
    return res.data.profile;
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function upsertMyProfile(input: ProfileInput): Promise<Profile> {
  const res = await httpClient.put<{ profile: Profile }>('/api/profile', input);
  return res.data.profile;
}
