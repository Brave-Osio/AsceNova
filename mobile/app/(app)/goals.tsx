import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Target } from 'lucide-react-native';
import { useGoals } from '../../src/features/goals/hooks/useGoals';
import GoalCard from '../../src/features/goals/components/GoalCard';
import GoalForm from '../../src/features/goals/components/GoalForm';
import PageHeader from '../../src/components/ui/PageHeader';
import Card from '../../src/components/ui/Card';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function GoalsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { goals, isLoading } = useGoals();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Progress</Text>
      <PageHeader title="Goals" subtitle="Set a target and track it separately from your everyday habits." />

      <GoalForm />

      <View style={styles.list}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : goals.length === 0 ? (
          <Card style={styles.empty}>
            <Target size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No goals yet — create one above.</Text>
          </Card>
        ) : (
          goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    eyebrow: { fontSize: 14, fontFamily: fonts.regular, color: colors.textMuted, marginBottom: 4 },
    list: { marginTop: spacing.md, gap: spacing.md },
    empty: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm + 4 },
    emptyText: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSecondary },
  });
}
