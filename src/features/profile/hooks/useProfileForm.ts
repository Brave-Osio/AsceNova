import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { upsertMyProfile } from '../../../services/profileService';
import { queryKeys } from '../../../lib/queryKeys';
import { ROUTES } from '../../../constants/routes';
import { showSuccessToast } from '../../../lib/toast';
import type { ProfileFormValues } from '../schemas';
import type { Profile, ProfileInput } from '../../../types/profile.types';

function toOptionalNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

function toOptionalNumberString(value: number | null): string {
  return value == null ? '' : String(value);
}

/** Inverse of toProfileInput — prefills the form when editing an existing profile. */
export function toFormValues(profile: Profile): ProfileFormValues {
  return {
    fullName: profile.fullName,
    birthday: profile.birthday ? profile.birthday.slice(0, 10) : '',
    age: String(profile.age),
    gender: profile.gender ?? 'PREFER_NOT_TO_SAY',
    heightCm: String(profile.heightCm),
    currentWeightKg: String(profile.currentWeightKg),
    goalWeightKg: toOptionalNumberString(profile.goalWeightKg),
    goal: profile.goal,
    fitnessLevel: profile.fitnessLevel,
    equipmentAccess: profile.equipmentAccess,
    activityLevel: profile.activityLevel ?? 'MODERATELY_ACTIVE',
    workoutFrequency: toOptionalNumberString(profile.workoutFrequency),
    preferredSplitStyle: profile.preferredSplitStyle ?? 'PUSH_PULL_LEGS',
    foodPreference: profile.foodPreference ?? 'OMNIVORE',
    foodAllergies: profile.foodAllergies,
    medicalRestrictions: profile.medicalRestrictions,
    preferredWorkoutTime: profile.dailySchedule?.preferredWorkoutTime ?? 'MORNING',
    sleepHoursTarget: toOptionalNumberString(profile.sleepHoursTarget),
  };
}

function toProfileInput(values: ProfileFormValues): ProfileInput {
  return {
    fullName: values.fullName,
    birthday: values.birthday || null,
    age: Number(values.age),
    gender: values.gender,
    heightCm: Number(values.heightCm),
    currentWeightKg: Number(values.currentWeightKg),
    goalWeightKg: toOptionalNumber(values.goalWeightKg),
    goal: values.goal,
    fitnessLevel: values.fitnessLevel,
    equipmentAccess: values.equipmentAccess,
    activityLevel: values.activityLevel,
    workoutFrequency: toOptionalNumber(values.workoutFrequency),
    preferredSplitStyle: values.preferredSplitStyle,
    foodPreference: values.foodPreference,
    foodAllergies: values.foodAllergies,
    medicalRestrictions: values.medicalRestrictions,
    dailySchedule: values.preferredWorkoutTime
      ? { preferredWorkoutTime: values.preferredWorkoutTime }
      : null,
    sleepHoursTarget: toOptionalNumber(values.sleepHoursTarget),
  };
}

/**
 * Saves the profile to the backend (replacing the old localStorage
 * write) and seeds the query cache with the response so the dashboard/
 * plan/log/leaderboard pages see it immediately without an extra fetch.
 */
export function useProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: ProfileFormValues) => upsertMyProfile(toProfileInput(values)),
    onSuccess: (profile) => {
      if (user) {
        queryClient.setQueryData(queryKeys.profile.detail(user.id), profile);
      }
      showSuccessToast('Profile saved!');
      navigate(ROUTES.plan);
    },
  });
}
