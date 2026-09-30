import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '../../src/components/ui/TextField';
import OptionSelector from '../../src/components/ui/OptionSelector';
import Button from '../../src/components/ui/Button';
import { getErrorMessage } from '../../src/lib/errors';
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
} from '../../src/features/profile/schemas';
import { useProfileForm, toFormValues } from '../../src/features/profile/hooks/useProfileForm';
import { useProfile } from '../../src/features/profile/hooks/useProfile';
import { spacing, typography, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

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

const DEFAULT_VALUES: ProfileFormValues = {
  fullName: '',
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

function SectionHeading({ children, styles }: { children: string; styles: ReturnType<typeof createStyles> }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

export default function ProfileSetupScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: existingProfile, isLoading: isProfileLoading } = useProfile();
  const { mutateAsync, isPending } = useProfileForm();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (existingProfile) {
      reset(toFormValues(existingProfile));
    }
  }, [existingProfile, reset]);

  async function onSubmit(values: ProfileFormValues) {
    setError(null);
    try {
      await mutateAsync(values);
      router.replace('/(app)');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (isProfileLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{existingProfile ? 'Edit Profile' : 'Set Up Your Profile'}</Text>

        <SectionHeading styles={styles}>Identity</SectionHeading>
        <Controller name="fullName" control={control} render={({ field }) => (
          <TextField label="Full Name" value={field.value} onChangeText={field.onChange} autoCapitalize="words" placeholder="Juan Dela Cruz" error={errors.fullName?.message} />
        )} />
        <Controller name="age" control={control} render={({ field }) => (
          <TextField label="Age" value={field.value} onChangeText={field.onChange} keyboardType="number-pad" placeholder="25" error={errors.age?.message} />
        )} />
        <Controller name="gender" control={control} render={({ field }) => (
          <OptionSelector label="Gender" value={field.value} options={toOptions(genderOptions, GENDER_LABELS)} onChange={field.onChange} />
        )} />

        <SectionHeading styles={styles}>Body & Goals</SectionHeading>
        <Controller name="heightCm" control={control} render={({ field }) => (
          <TextField label="Height (cm)" value={field.value} onChangeText={field.onChange} keyboardType="number-pad" placeholder="175" error={errors.heightCm?.message} />
        )} />
        <Controller name="currentWeightKg" control={control} render={({ field }) => (
          <TextField label="Current Weight (kg)" value={field.value} onChangeText={field.onChange} keyboardType="numeric" placeholder="70" error={errors.currentWeightKg?.message} />
        )} />
        <Controller name="goalWeightKg" control={control} render={({ field }) => (
          <TextField label="Goal Weight (kg)" value={field.value} onChangeText={field.onChange} keyboardType="numeric" placeholder="65" helperText="Optional" error={errors.goalWeightKg?.message} />
        )} />
        <Controller name="goal" control={control} render={({ field }) => (
          <OptionSelector label="Goal" value={field.value} options={toOptions(goalOptions, GOAL_LABELS)} onChange={field.onChange} />
        )} />

        <SectionHeading styles={styles}>Training</SectionHeading>
        <Controller name="fitnessLevel" control={control} render={({ field }) => (
          <OptionSelector label="Fitness Level" value={field.value} options={toOptions(fitnessLevelOptions, FITNESS_LEVEL_LABELS)} onChange={field.onChange} />
        )} />
        <Controller name="equipmentAccess" control={control} render={({ field }) => (
          <OptionSelector label="Equipment Access" value={field.value} options={toOptions(equipmentAccessOptions, EQUIPMENT_LABELS)} onChange={field.onChange} />
        )} />
        <Controller name="activityLevel" control={control} render={({ field }) => (
          <OptionSelector label="Activity Level" value={field.value} options={toOptions(activityLevelOptions, ACTIVITY_LEVEL_LABELS)} onChange={field.onChange} />
        )} />
        <Controller name="preferredSplitStyle" control={control} render={({ field }) => (
          <OptionSelector label="Preferred Workout Split" value={field.value} options={toOptions(splitStyleOptions, SPLIT_STYLE_LABELS)} onChange={field.onChange} />
        )} />
        <Controller name="workoutFrequency" control={control} render={({ field }) => (
          <TextField label="Workout Days / Week" value={field.value} onChangeText={field.onChange} keyboardType="number-pad" placeholder="4" helperText="Optional" error={errors.workoutFrequency?.message} />
        )} />

        <SectionHeading styles={styles}>Schedule</SectionHeading>
        <Controller name="preferredWorkoutTime" control={control} render={({ field }) => (
          <OptionSelector label="Preferred Workout Time" value={field.value} options={toOptions(preferredWorkoutTimeOptions, WORKOUT_TIME_LABELS)} onChange={field.onChange} />
        )} />
        <Controller name="sleepHoursTarget" control={control} render={({ field }) => (
          <TextField label="Sleep Hours Target" value={field.value} onChangeText={field.onChange} keyboardType="number-pad" placeholder="8" helperText="Optional" error={errors.sleepHoursTarget?.message} />
        )} />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button onPress={handleSubmit(onSubmit)} loading={isPending}>
          {existingProfile ? 'Save Changes' : 'Generate My Plan'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
    sectionHeading: { ...typography.label, color: colors.primaryLight, marginTop: spacing.md, marginBottom: spacing.sm },
    error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  });
}
