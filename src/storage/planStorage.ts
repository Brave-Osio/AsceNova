import { getItem, setItem, removeItem } from './localStorageClient';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { FitnessPlan } from '../types/plan.types';

export function savePlan(plan: FitnessPlan): void {
  setItem(STORAGE_KEYS.plan, plan);
}

export function getPlan(): FitnessPlan | null {
  return getItem<FitnessPlan>(STORAGE_KEYS.plan);
}

export function clearPlan(): void {
  removeItem(STORAGE_KEYS.plan);
}
