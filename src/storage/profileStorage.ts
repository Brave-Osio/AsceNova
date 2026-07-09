import { getItem, setItem, removeItem } from './localStorageClient';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { Profile, ProfileInput } from '../types/profile.types';

/**
 * Saves a profile, stamping createdAt only if one doesn't already
 * exist (so re-saving an edited profile doesn't reset its creation date).
 */
export function saveProfile(input: ProfileInput): Profile {
  const existing = getProfile();
  const profile: Profile = {
    ...input,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.profile, profile);
  return profile;
}

export function getProfile(): Profile | null {
  return getItem<Profile>(STORAGE_KEYS.profile);
}

export function clearProfile(): void {
  removeItem(STORAGE_KEYS.profile);
}
