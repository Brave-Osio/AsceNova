import { useEffect, useState } from 'react';
import { useProfile } from '../../profile/hooks/useProfile';
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
 * Once the profile query resolves: if a profile exists, use any cached
 * plan first (avoids regenerating — and re-billing a real API later —
 * on every page visit), otherwise generate one and cache it. If no
 * profile exists at all, plan stays null and the page renders an empty
 * state rather than crashing.
 */
export function usePlanGenerator(): UsePlanGeneratorResult {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadOrGenerate(currentProfile: Profile) {
    const cachedPlan = getPlan();
    if (cachedPlan) {
      setPlan(cachedPlan);
      return;
    }

    setIsGenerating(true);
    const newPlan = await generatePlan(currentProfile);
    savePlan(newPlan);
    setPlan(newPlan);
    setIsGenerating(false);
  }

  async function regenerate(splitStyle?: WorkoutSplitStyle) {
    if (!profile) return;
    setIsGenerating(true);
    const styleToUse = splitStyle ?? plan?.splitStyle;
    const newPlan = await generatePlan(profile, styleToUse);
    savePlan(newPlan);
    setPlan(newPlan);
    setIsGenerating(false);
  }

  useEffect(() => {
    if (profile) {
      loadOrGenerate(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return { plan, profile: profile ?? null, isLoading: isProfileLoading || isGenerating, regenerate };
}
