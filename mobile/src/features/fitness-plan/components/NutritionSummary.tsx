import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Beef, Wheat, Droplet, Sparkles, Droplets } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { NutritionPlan } from '../../../types/plan.types';
import { spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';

interface NutritionSummaryProps {
  nutrition: NutritionPlan;
}

/**
 * Simplified from the web's NutritionPanel.tsx — flat accent colors and no
 * gradient fills (would need expo-linear-gradient), same data, same layout idea.
 */
export default function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items: { label: string; value: string; sub: string; Icon: LucideIcon }[] = [
    { label: 'Calories', value: `${nutrition.calories}`, sub: 'kcal / day', Icon: Flame },
    { label: 'Protein', value: `${nutrition.proteinGrams}g`, sub: 'per day', Icon: Beef },
    { label: 'Carbs', value: `${nutrition.carbsGrams}g`, sub: 'per day', Icon: Wheat },
    { label: 'Fat', value: `${nutrition.fatGrams}g`, sub: 'per day', Icon: Droplet },
    { label: 'Sodium', value: `${nutrition.sodiumMg}mg`, sub: 'daily limit', Icon: Sparkles },
    { label: 'Water', value: `${nutrition.waterLiters}L`, sub: 'daily target', Icon: Droplets },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <item.Icon size={16} color={colors.primaryLight} style={styles.icon} />
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.sub}>{item.sub}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    card: {
      width: '31%',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    icon: { marginBottom: spacing.xs },
    value: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
    label: { color: colors.primaryLight, fontSize: 11, fontWeight: '700', marginTop: 2 },
    sub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  });
}
