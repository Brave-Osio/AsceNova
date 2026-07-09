import TextField from '../../../components/ui/TextField';
import OptionSelector from '../../../components/ui/OptionSelector';
import Button from '../../../components/ui/Button';
import { useProfileForm } from '../hooks/useProfileForm';

const GOAL_OPTIONS = [
  { value: 'weight_loss' as const, label: 'Weight Loss' },
  { value: 'muscle_gain' as const, label: 'Muscle Gain' },
  { value: 'maintain_weight' as const, label: 'Maintain Weight' },
];

const FITNESS_LEVEL_OPTIONS = [
  { value: 'beginner' as const, label: 'Beginner' },
  { value: 'intermediate' as const, label: 'Intermediate' },
  { value: 'advanced' as const, label: 'Advanced' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'home' as const, label: 'Home' },
  { value: 'gym' as const, label: 'Gym' },
  { value: 'both' as const, label: 'Both' },
];

export default function ProfileSetupForm() {
  const { form, errors, updateField, handleSubmit } = useProfileForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Name"
          value={form.name}
          onChange={(v) => updateField('name', v)}
          placeholder="Your name"
          error={errors.name}
        />
        <TextField
          label="Age"
          type="number"
          value={form.age}
          onChange={(v) => updateField('age', v)}
          placeholder="25"
          error={errors.age}
        />
        <TextField
          label="Height (cm)"
          type="number"
          value={form.heightCm}
          onChange={(v) => updateField('heightCm', v)}
          placeholder="175"
          error={errors.heightCm}
        />
        <TextField
          label="Weight (kg)"
          type="number"
          value={form.weightKg}
          onChange={(v) => updateField('weightKg', v)}
          placeholder="70"
          error={errors.weightKg}
        />
      </div>

      <OptionSelector
        label="Goal"
        value={form.goal}
        options={GOAL_OPTIONS}
        onChange={(v) => updateField('goal', v)}
      />

      <OptionSelector
        label="Fitness Level"
        value={form.fitnessLevel}
        options={FITNESS_LEVEL_OPTIONS}
        onChange={(v) => updateField('fitnessLevel', v)}
      />

      <OptionSelector
        label="Equipment Access"
        value={form.equipmentAccess}
        options={EQUIPMENT_OPTIONS}
        onChange={(v) => updateField('equipmentAccess', v)}
      />

      <div className="pt-2">
        <Button type="submit">Generate My Plan</Button>
      </div>
    </form>
  );
}
