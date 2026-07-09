import { useEffect, useState } from 'react';
import { getProfile } from '../../../storage/profileStorage';
import { getPlan, savePlan } from '../../../storage/planStorage';
import { generatePlan } from '../../../services/fitnessService';
import type { FitnessPlan, WorkoutSplitStyle } from '../../../types/plan.types';
import type { Profile } from '../../../types/profile.types';

interface UsePlanGeneratorResult {
  plan: FitnessPlan | null;
  profile: Profile | null;
  isLoading: boolean;
  /** Regenerates using the given split style, or the plan's current style if omitted. */
  regenerate: (splitStyle?: WorkoutSplitStyle) => Promise<void>;
}

/**
 * On mount: if a profile exists, use any cached plan first (avoids
 * regenerating — and re-billing a real API later — on every page visit),
 * otherwise generate one and cache it. If no profile exists at all,
 * plan/profile stay null and the page renders an empty state rather
 * than crashing (per the no-route-guards decision from Phase 1).
 */
export function usePlanGenerator(): UsePlanGeneratorResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrGenerate() {
    const currentProfile = getProfile();
    setProfile(currentProfile);

    if (!currentProfile) {
      setPlan(null);
      setIsLoading(false);
      return;
    }

    const cachedPlan = getPlan();
    if (cachedPlan) {
      setPlan(cachedPlan);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const newPlan = await generatePlan(currentProfile);
    savePlan(newPlan);
    setPlan(newPlan);
    setIsLoading(false);
  }

  async function regenerate(splitStyle?: WorkoutSplitStyle) {
    if (!profile) return;
    setIsLoading(true);
    const styleToUse = splitStyle ?? plan?.splitStyle;
    const newPlan = await generatePlan(profile, styleToUse);
    savePlan(newPlan);
    setPlan(newPlan);
    setIsLoading(false);
  }

  useEffect(() => {
    loadOrGenerate();
  }, []);

  return { plan, profile, isLoading, regenerate };
}
