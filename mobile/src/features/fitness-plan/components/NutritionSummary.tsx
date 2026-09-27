import { View, Text, StyleSheet } from 'react-native';
import type { NutritionPlan } from '../../../types/plan.types';
import { colors, spacing, radius } from '../../../theme';

interface NutritionSummaryProps {
  nutrition: NutritionPlan;
}

/**
 * Simplified from the web's NutritionPanel.tsx — flat accent colors and no
 * gradient fills (would need expo-linear-gradient), same data, same layout idea.
 */
export default function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const items = [
    { label: 'Calories', value: `${nutrition.calories}`, sub: 'kcal / day', icon: '🔥' },
    { label: 'Protein', value: `${nutrition.proteinGrams}g`, sub: 'per day', icon: '💪' },
    { label: 'Carbs', value: `${nutrition.carbsGrams}g`, sub: 'per day', icon: '⚡' },
    { label: 'Fat', value: `${nutrition.fatGrams}g`, sub: 'per day', icon: '🧈' },
    { label: 'Sodium', value: `${nutrition.sodiumMg}mg`, sub: 'daily limit', icon: '🧂' },
    { label: 'Water', value: `${nutrition.waterLiters}L`, sub: 'daily target', icon: '💧' },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.sub}>{item.sub}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '31%',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  icon: { fontSize: 16, marginBottom: spacing.xs },
  value: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  label: { color: colors.violetLight, fontSize: 11, fontWeight: '700', marginTop: 2 },
  sub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
});
