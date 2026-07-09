import { getItem, setItem } from './localStorageClient';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_PROGRESS, type UserProgress } from '../types/gamification.types';

/**
 * This is the storage backing for UserProgressContext (Step 5). Every
 * write here is a full-object overwrite — callers (engines) are
 * responsible for reading current progress, computing the next state,
 * and passing the complete object back. Storage itself does no math.
 */
export function saveProgress(progress: UserProgress): void {
  setItem(STORAGE_KEYS.progress, progress);
}

export function getProgress(): UserProgress {
  return getItem<UserProgress>(STORAGE_KEYS.progress) ?? DEFAULT_PROGRESS;
}

export function resetProgress(): void {
  setItem(STORAGE_KEYS.progress, DEFAULT_PROGRESS);
}
