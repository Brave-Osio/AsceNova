import { useState } from 'react';
import OptionSelector from '../../../components/ui/OptionSelector';
import TextField from '../../../components/ui/TextField';
import TextArea from '../../../components/ui/TextArea';
import Button from '../../../components/ui/Button';
import { useGoalActions } from '../hooks/useGoalActions';
import { getTodayDateString } from '../../../utils/dateUtils';
import { validateNotPastDate, validateWeightKg, WEIGHT_KG_MAX, WEIGHT_KG_MIN } from '../../../utils/validation';
import type { FitnessGoalType } from '../../../types/goal.types';

const GOAL_TYPE_OPTIONS: { value: FitnessGoalType; label: string }[] = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain' },
  { value: 'MAINTAIN_WEIGHT', label: 'Maintain Weight' },
];

interface FieldErrors {
  targetValue?: string;
  targetDate?: string;
}

export default function GoalForm() {
  const { create, isCreating } = useGoalActions();
  const [goalType, setGoalType] = useState<FitnessGoalType>('WEIGHT_LOSS');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Every goal type is a body-weight target in kg, so the target value uses
  // the same weight rules as the daily log. Both fields are optional.
  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (targetValue.trim()) {
      const message = validateWeightKg(targetValue, 'Target value');
      if (message) next.targetValue = message;
    }
    if (targetDate.trim()) {
      const message = validateNotPastDate(targetDate.trim(), getTodayDateString(), 'Target date');
      if (message) next.targetDate = message;
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const ok = await create({
      goalType,
      targetValue: targetValue.trim() ? Number(targetValue) : undefined,
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
    <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-4 rounded-2xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">New Goal</div>
      <OptionSelector label="Goal Type" value={goalType} options={GOAL_TYPE_OPTIONS} onChange={setGoalType} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Target Value (kg)"
          type="number"
          value={targetValue}
          onChange={(v) => {
            setTargetValue(v);
            if (errors.targetValue) setErrors((prev) => ({ ...prev, targetValue: undefined }));
          }}
          placeholder="70"
          min={WEIGHT_KG_MIN}
          max={WEIGHT_KG_MAX}
          step="0.1"
          helperText="Optional"
          error={errors.targetValue}
        />
        <TextField
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={(v) => {
            setTargetDate(v);
            if (errors.targetDate) setErrors((prev) => ({ ...prev, targetDate: undefined }));
          }}
          min={getTodayDateString()}
          helperText="Optional"
          error={errors.targetDate}
        />
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
