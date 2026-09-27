import { useState } from 'react';
import OptionSelector from '../../../components/ui/OptionSelector';
import TextField from '../../../components/ui/TextField';
import TextArea from '../../../components/ui/TextArea';
import Button from '../../../components/ui/Button';
import { useGoalActions } from '../hooks/useGoalActions';
import type { FitnessGoalType } from '../../../types/goal.types';

const GOAL_TYPE_OPTIONS: { value: FitnessGoalType; label: string }[] = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain' },
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight' },
];

export default function GoalForm() {
  const { create, isCreating } = useGoalActions();
  const [goalType, setGoalType] = useState<FitnessGoalType>('WEIGHT_LOSS');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progressNote, setProgressNote] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await create({
      goalType,
      targetValue: targetValue.trim() ? Number(targetValue) : undefined,
      targetDate: targetDate.trim() || undefined,
      progressNote: progressNote.trim() || undefined,
    });
    setTargetValue('');
    setTargetDate('');
    setProgressNote('');
  }

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-4 rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-500">New Goal</div>
      <OptionSelector label="Goal Type" value={goalType} options={GOAL_TYPE_OPTIONS} onChange={setGoalType} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Target Value (kg)"
          type="number"
          value={targetValue}
          onChange={setTargetValue}
          placeholder="70"
          helperText="Optional"
        />
        <TextField label="Target Date" type="date" value={targetDate} onChange={setTargetDate} helperText="Optional" />
      </div>
      <TextArea label="Notes" value={progressNote} onChange={setProgressNote} placeholder="Optional notes about this goal" />
      <div>
        <Button type="submit" loading={isCreating}>
          Create Goal
        </Button>
      </div>
    </form>
  );
}
