import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../../components/ui/TextField';
import OptionSelector from '../../../components/ui/OptionSelector';
import Button from '../../../components/ui/Button';
import { getErrorMessage } from '../../../lib/errors';
import {
  profileSchema,
  genderOptions,
  goalOptions,
  fitnessLevelOptions,
  equipmentAccessOptions,
  activityLevelOptions,
  splitStyleOptions,
  preferredWorkoutTimeOptions,
  type ProfileFormValues,
} from '../schemas';
import { useProfileForm, toFormValues } from '../hooks/useProfileForm';
import { useProfile } from '../hooks/useProfile';

const GENDER_LABELS: Record<(typeof genderOptions)[number], string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const GOAL_LABELS: Record<(typeof goalOptions)[number], string> = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTAIN_WEIGHT: 'Maintain Weight',
};

const FITNESS_LEVEL_LABELS: Record<(typeof fitnessLevelOptions)[number], string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const EQUIPMENT_LABELS: Record<(typeof equipmentAccessOptions)[number], string> = {
  HOME: 'Home',
  GYM: 'Gym',
  BOTH: 'Both',
};

const ACTIVITY_LEVEL_LABELS: Record<(typeof activityLevelOptions)[number], string> = {
  SEDENTARY: 'Sedentary',
  LIGHTLY_ACTIVE: 'Lightly Active',
  MODERATELY_ACTIVE: 'Moderately Active',
  VERY_ACTIVE: 'Very Active',
  EXTRA_ACTIVE: 'Extra Active',
};

const SPLIT_STYLE_LABELS: Record<(typeof splitStyleOptions)[number], string> = {
  PUSH_PULL_LEGS: 'Push / Pull / Legs',
  UPPER_LOWER: 'Upper / Lower',
  FULL_BODY: 'Full Body',
};

const WORKOUT_TIME_LABELS: Record<(typeof preferredWorkoutTimeOptions)[number], string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};

function toOptions<T extends string>(values: readonly T[], labels: Record<T, string>) {
  return values.map((value) => ({ value, label: labels[value] }));
}

const GENDER_UI_OPTIONS = toOptions(genderOptions, GENDER_LABELS);
const GOAL_UI_OPTIONS = toOptions(goalOptions, GOAL_LABELS);
const FITNESS_LEVEL_UI_OPTIONS = toOptions(fitnessLevelOptions, FITNESS_LEVEL_LABELS);
const EQUIPMENT_UI_OPTIONS = toOptions(equipmentAccessOptions, EQUIPMENT_LABELS);
const ACTIVITY_LEVEL_UI_OPTIONS = toOptions(activityLevelOptions, ACTIVITY_LEVEL_LABELS);
const SPLIT_STYLE_UI_OPTIONS = toOptions(splitStyleOptions, SPLIT_STYLE_LABELS);
const WORKOUT_TIME_UI_OPTIONS = toOptions(preferredWorkoutTimeOptions, WORKOUT_TIME_LABELS);

const DEFAULT_VALUES: ProfileFormValues = {
  fullName: '',
  birthday: '',
  age: '',
  gender: 'PREFER_NOT_TO_SAY',
  heightCm: '',
  currentWeightKg: '',
  goalWeightKg: '',
  goal: 'WEIGHT_LOSS',
  fitnessLevel: 'BEGINNER',
  equipmentAccess: 'BOTH',
  activityLevel: 'MODERATELY_ACTIVE',
  workoutFrequency: '',
  preferredSplitStyle: 'PUSH_PULL_LEGS',
  preferredWorkoutTime: 'MORNING',
  sleepHoursTarget: '',
};

function SectionHeading({ children }: { children: string }) {
  return <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-primary-light">{children}</h2>;
}

interface ProfileSetupFormProps {
  submitLabel?: string;
  redirectOnSave?: boolean;
}

export default function ProfileSetupForm({
  submitLabel = 'Generate My Plan',
  redirectOnSave = true,
}: ProfileSetupFormProps = {}) {
  const { data: existingProfile, isLoading: isProfileLoading } = useProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { mutate, isPending, error } = useProfileForm({ redirect: redirectOnSave });

  // Prefill when editing an existing profile — without this, resubmitting
  // would overwrite real data with the form's blank defaults.
  useEffect(() => {
    if (existingProfile) {
      reset(toFormValues(existingProfile));
    }
  }, [existingProfile, reset]);

  if (isProfileLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} className="flex flex-col gap-8">
      <section>
        <SectionHeading>Identity</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField label="Full Name" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="Juan Dela Cruz" error={errors.fullName?.message} />
            )}
          />
          <Controller
            name="birthday"
            control={control}
            render={({ field }) => (
              <TextField label="Birthday" type="date" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.birthday?.message} />
            )}
          />
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField label="Age" type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="25" error={errors.age?.message} />
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <OptionSelector label="Gender" value={field.value} options={GENDER_UI_OPTIONS} onChange={field.onChange} />
            )}
          />
        </div>
      </section>

      <section>
        <SectionHeading>Body & Goals</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="heightCm"
            control={control}
            render={({ field }) => (
              <TextField label="Height (cm)" type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="175" error={errors.heightCm?.message} />
            )}
          />
          <Controller
            name="currentWeightKg"
            control={control}
            render={({ field }) => (
              <TextField label="Current Weight (kg)" type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="70" error={errors.currentWeightKg?.message} />
            )}
          />
          <Controller
            name="goalWeightKg"
            control={control}
            render={({ field }) => (
              <TextField label="Goal Weight (kg)" type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="65" helperText="Optional" error={errors.goalWeightKg?.message} />
            )}
          />
        </div>
        <div className="mt-4">
          <Controller name="goal" control={control} render={({ field }) => <OptionSelector label="Goal" value={field.value} options={GOAL_UI_OPTIONS} onChange={field.onChange} />} />
        </div>
      </section>

      <section>
        <SectionHeading>Training</SectionHeading>
        <div className="flex flex-col gap-4">
          <Controller name="fitnessLevel" control={control} render={({ field }) => <OptionSelector label="Fitness Level" value={field.value} options={FITNESS_LEVEL_UI_OPTIONS} onChange={field.onChange} />} />
          <Controller name="equipmentAccess" control={control} render={({ field }) => <OptionSelector label="Equipment Access" value={field.value} options={EQUIPMENT_UI_OPTIONS} onChange={field.onChange} />} />
          <Controller name="activityLevel" control={control} render={({ field }) => <OptionSelector label="Activity Level" value={field.value} options={ACTIVITY_LEVEL_UI_OPTIONS} onChange={field.onChange} />} />
          <Controller name="preferredSplitStyle" control={control} render={({ field }) => <OptionSelector label="Preferred Workout Split" value={field.value} options={SPLIT_STYLE_UI_OPTIONS} onChange={field.onChange} />} />
          <Controller
            name="workoutFrequency"
            control={control}
            render={({ field }) => (
              <div className="max-w-xs">
                <TextField label="Workout Days / Week" type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="4" helperText="Optional" error={errors.workoutFrequency?.message} />
              </div>
            )}
          />
        </div>
      </section>

      <section>
        <SectionHeading>Schedule</SectionHeading>
        <div className="flex flex-col gap-4">
          <Controller name="preferredWorkoutTime" control={control} render={({ field }) => <OptionSelector label="Preferred Workout Time" value={field.value} options={WORKOUT_TIME_UI_OPTIONS} onChange={field.onChange} />} />
          <Controller
            name="sleepHoursTarget"
            control={control}
            render={({ field }) => (
              <div className="max-w-xs">
                <TextField label="Sleep Hours Target" type="number" value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="8" helperText="Optional" error={errors.sleepHoursTarget?.message} />
              </div>
            )}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-400">{getErrorMessage(error)}</p>}

      <div className="pt-2">
        <Button type="submit" loading={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
