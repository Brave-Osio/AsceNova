import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Beef, Wheat, Droplet, Sparkles, Droplets } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { NutritionPlan } from '../../../types/plan.types';
import { fonts, spacing, radius, type ColorPalette } from '../../../theme';
import { useAppTheme } from '../../../context/ThemeContext';
import Card from '../../../components/ui/Card';

interface NutritionSummaryProps {
  nutrition: NutritionPlan;
}

interface MacroItem {
  label: string;
  value: string;
  sub: string;
  tint: string;
  Icon: LucideIcon;
  pct?: number;
}

const PROTEIN = '#60a5fa';
const CARBS = '#fbbf24';
const FAT = '#fb7185';
const SODIUM = '#2dd4bf';
const WATER = '#38bdf8';

/** Same layout as the web's NutritionPanel: macro ratio bar + legend, then a 2-col card grid. */
export default function NutritionSummary({ nutrition }: NutritionSummaryProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const totalMacroCals = nutrition.proteinGrams * 4 + nutrition.carbsGrams * 4 + nutrition.fatGrams * 9;
  const pct = (cals: number) => (totalMacroCals > 0 ? Math.round((cals / totalMacroCals) * 100) : 0);
  const proteinPct = pct(nutrition.proteinGrams * 4);
  const carbsPct = pct(nutrition.carbsGrams * 4);
  const fatPct = pct(nutrition.fatGrams * 9);

  const items: MacroItem[] = [
    { label: 'Calories', value: `${nutrition.calories}`, sub: 'kcal / day', tint: colors.primaryLight, Icon: Flame },
    { label: 'Protein', value: `${nutrition.proteinGrams}g`, sub: `${proteinPct}% of macros`, tint: PROTEIN, Icon: Beef, pct: proteinPct },
    { label: 'Carbs', value: `${nutrition.carbsGrams}g`, sub: `${carbsPct}% of macros`, tint: CARBS, Icon: Wheat, pct: carbsPct },
    { label: 'Fat', value: `${nutrition.fatGrams}g`, sub: `${fatPct}% of macros`, tint: FAT, Icon: Droplet, pct: fatPct },
    { label: 'Sodium', value: `${nutrition.sodiumMg}mg`, sub: 'daily limit', tint: SODIUM, Icon: Sparkles },
    { label: 'Water', value: `${nutrition.waterLiters}L`, sub: 'daily target', tint: WATER, Icon: Droplets },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.ratioBar}>
        <View style={[styles.segment, { width: `${proteinPct}%`, backgroundColor: PROTEIN }]} />
        <View style={[styles.segment, { width: `${carbsPct}%`, backgroundColor: CARBS }]} />
        <View style={[styles.segment, styles.segmentFill, { backgroundColor: FAT }]} />
      </View>
      <View style={styles.legend}>
        {[
          { label: 'Protein', color: PROTEIN },
          { label: 'Carbs', color: CARBS },
          { label: 'Fat', color: FAT },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <Card key={item.label} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.iconBox, { backgroundColor: `${item.tint}26` }]}>
                <item.Icon size={14} color={item.tint} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
            {item.pct !== undefined && (
              <View style={styles.track}>
                <View style={[styles.trackFill, { width: `${item.pct}%`, backgroundColor: item.tint }]} />
              </View>
            )}
          </Card>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrap: { gap: 12 },
    ratioBar: {
      height: 12,
      flexDirection: 'row',
      gap: 2,
      borderRadius: radius.full,
      overflow: 'hidden',
      backgroundColor: colors.cardAlt,
    },
    segment: { height: '100%', borderRadius: radius.full },
    segmentFill: { flex: 1 },
    legend: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: 2 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: radius.full },
    legendText: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: { width: '47%', flexGrow: 1, padding: spacing.md },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    iconBox: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
    label: { color: colors.textSecondary, fontSize: 12, fontFamily: fonts.semibold },
    value: { color: colors.textPrimary, fontSize: 24, fontFamily: fonts.bold, lineHeight: 28, marginTop: spacing.sm },
    sub: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.regular, marginTop: 4 },
    track: {
      height: 4,
      marginTop: 12,
      borderRadius: radius.full,
      backgroundColor: colors.cardAlt,
      overflow: 'hidden',
    },
    trackFill: { height: '100%', borderRadius: radius.full },
  });
}
