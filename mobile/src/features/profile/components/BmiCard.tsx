import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Activity } from 'lucide-react-native';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useProfile } from '../hooks/useProfile';
import { fonts, radius, spacing, typography, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import type { BmiCategory } from '../../../types/profile.types';

const CATEGORY: Record<BmiCategory, { label: string; explanation: string }> = {
  UNDERWEIGHT: { label: 'Underweight', explanation: 'Your BMI is below 18.5, which is in the underweight range for adults.' },
  NORMAL: { label: 'Normal weight', explanation: 'Your BMI is between 18.5 and 24.9, which is in the normal weight range for adults.' },
  OVERWEIGHT: { label: 'Overweight', explanation: 'Your BMI is between 25 and 29.9, which is in the overweight range for adults.' },
  OBESE: { label: 'Obesity', explanation: 'Your BMI is 30 or above, which is in the obesity range for adults.' },
};

/**
 * Body Mass Index from the profile's current height and weight. The API computes it on every read
 * (kg / m²), so it always matches the saved profile — nothing is stored or cached separately.
 */
export default function BmiCard() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <Card style={styles.skeleton}>{null}</Card>;

  const bmi = profile?.bmi ?? null;
  const category = bmi ? CATEGORY[bmi.category] : null;
  const tone: Record<BmiCategory, string> = {
    UNDERWEIGHT: '#38bdf8',
    NORMAL: colors.success,
    OVERWEIGHT: '#f59e0b',
    OBESE: colors.danger,
  };

  return (
    <Card style={styles.card}>
      <View style={styles.labelRow}>
        <Activity size={14} color={colors.textMuted} />
        <Text style={styles.label}>Body Mass Index</Text>
      </View>

      {bmi && category && profile ? (
        <>
          <View style={styles.valueRow}>
            <Text style={styles.value} accessibilityLabel={`BMI ${bmi.value}`}>
              {bmi.value.toFixed(1)}
            </Text>
            <View style={[styles.chip, { borderColor: tone[bmi.category] }]}>
              <Text style={[styles.chipText, { color: tone[bmi.category] }]}>{category.label}</Text>
            </View>
          </View>
          <Text style={styles.body}>{category.explanation}</Text>
          <Text style={styles.small}>
            Based on your profile: {profile.heightCm} cm and {profile.currentWeightKg} kg. It updates when you save changes to either.
          </Text>
        </>
      ) : (
        <View style={styles.prompt}>
          <Text style={styles.body}>Add a valid height and weight in your profile to see your BMI.</Text>
          <Button size="sm" variant="secondary" fullWidth={false} onPress={() => router.push('/(app)/settings')}>
            Complete your profile
          </Button>
        </View>
      )}

      <Text style={styles.disclaimer}>
        BMI is a general screening measure. It doesn&apos;t measure body fat or give a complete picture of your health, so talk to a
        healthcare professional about your individual situation.
      </Text>
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    skeleton: { height: 140, marginBottom: spacing.md },
    card: { marginBottom: spacing.md, gap: spacing.sm },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: { ...typography.label, color: colors.textMuted },
    valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    value: { color: colors.textPrimary, fontSize: 38, fontFamily: fonts.extrabold },
    chip: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4 },
    chipText: { fontSize: 12, fontFamily: fonts.semibold },
    body: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.regular, lineHeight: 20 },
    small: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, lineHeight: 17 },
    prompt: { gap: spacing.sm, alignItems: 'flex-start' },
    disclaimer: {
      color: colors.textMuted,
      fontSize: 12,
      fontFamily: fonts.regular,
      lineHeight: 17,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      marginTop: spacing.xs,
    },
  });
}
