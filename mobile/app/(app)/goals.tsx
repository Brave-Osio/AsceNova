import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Target } from 'lucide-react-native';
import { useGoals } from '../../src/features/goals/hooks/useGoals';
import GoalCard from '../../src/features/goals/components/GoalCard';
import GoalForm from '../../src/features/goals/components/GoalForm';
import PageHeader from '../../src/components/ui/PageHeader';
import { ShowHiddenToggle } from '../../src/components/ui/HideControls';
import { useHiddenIds } from '../../src/lib/useHiddenIds';
import Card from '../../src/components/ui/Card';
import { fonts, spacing, type ColorPalette } from '../../src/theme';
import { useAppTheme } from '../../src/context/ThemeContext';

export default function GoalsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { goals, isLoading } = useGoals();
  const hidden = useHiddenIds('goals');
  const [showHidden, setShowHidden] = useState(false);

  const hiddenCount = goals.filter((g) => hidden.isHidden(g.id)).length;
  const visible = showHidden ? goals : goals.filter((g) => !hidden.isHidden(g.id));

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PageHeader eyebrow="Progress" title="Goals" subtitle="Set a target and track it separately from your everyday habits." />

      <GoalForm />

      <View style={styles.list}>
        <ShowHiddenToggle count={hiddenCount} showing={showHidden} onToggle={() => setShowHidden((v) => !v)} />
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : visible.length === 0 ? (
          <Card style={styles.empty}>
            <Target size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              {goals.length === 0 ? 'No goals yet. Create your first one above.' : 'All of your goals are hidden. Use Show hidden to see them.'}
            </Text>
          </Card>
        ) : (
          visible.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isHidden={hidden.isHidden(goal.id)}
              onHide={() => hidden.hide(goal.id)}
              onUnhide={() => hidden.unhide(goal.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { paddingHorizontal: spacing.md + 4, paddingBottom: spacing.xl * 2 },
    list: { marginTop: spacing.md, gap: spacing.md },
    empty: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm + 4 },
    emptyText: { fontSize: 14, fontFamily: fonts.regular, color: colors.textSecondary },
  });
}
