import { useState } from 'react';
import { StyleSheet } from 'react-native';
import OptionSelector from '../../../components/ui/OptionSelector';
import TextField from '../../../components/ui/TextField';
import TextArea from '../../../components/ui/TextArea';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { SectionLabel } from '../../../components/ui/PageHeader';
import { useGoalActions } from '../hooks/useGoalActions';
import type { FitnessGoalType } from '../../../types/goal.types';
import { spacing } from '../../../theme';

const GOAL_TYPE_OPTIONS: { value: FitnessGoalType; label: string }[] = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain' },
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight' },
];

/** Mirrors the web app's GoalForm.tsx (the web's native date picker becomes a YYYY-MM-DD text field). */
export default function GoalForm() {
  const { create, isCreating } = useGoalActions();
  const [goalType, setGoalType] = useState<FitnessGoalType>('WEIGHT_LOSS');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progressNote, setProgressNote] = useState('');

  async function handleSubmit() {
    const parsed = targetValue.trim() ? Number(targetValue) : undefined;
    const ok = await create({
      goalType,
      targetValue: parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined,
      targetDate: targetDate.trim() || undefined,
      progressNote: progressNote.trim() || undefined,
    });
    if (ok) {
      setTargetValue('');
      setTargetDate('');
      setProgressNote('');
    }
  }

  return (
    <Card style={styles.card}>
      <SectionLabel>New Goal</SectionLabel>
      <OptionSelector label="Goal Type" value={goalType} options={GOAL_TYPE_OPTIONS} onChange={setGoalType} />
      <TextField
        label="Target Value (kg)"
        keyboardType="decimal-pad"
        value={targetValue}
        onChangeText={setTargetValue}
        placeholder="70"
        helperText="Optional"
      />
      <TextField
        label="Target Date"
        keyboardType="numbers-and-punctuation"
        value={targetDate}
        onChangeText={setTargetDate}
        placeholder="YYYY-MM-DD"
        helperText="Optional"
      />
      <TextArea label="Notes" value={progressNote} onChangeText={setProgressNote} placeholder="Optional notes about this goal" />
      <Button fullWidth={false} onPress={() => void handleSubmit()} loading={isCreating}>
        Create Goal
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
});
