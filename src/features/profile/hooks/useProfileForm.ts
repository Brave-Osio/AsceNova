import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../../../storage/profileStorage';
import { validateRequired, validateNumberInRange } from '../../../utils/validation';
import { ROUTES } from '../../../constants/routes';
import type { FitnessGoal, FitnessLevel, EquipmentAccess } from '../../../types/profile.types';

export interface ProfileFormState {
  name: string;
  age: string;
  heightCm: string;
  weightKg: string;
  goal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  equipmentAccess: EquipmentAccess;
}

const INITIAL_STATE: ProfileFormState = {
  name: '',
  age: '',
  heightCm: '',
  weightKg: '',
  goal: 'weight_loss',
  fitnessLevel: 'beginner',
  equipmentAccess: 'both',
};

/**
 * Fields stay as strings in form state (matching <input> values directly)
 * and are only parsed to numbers at validation/submit time. This avoids
 * the common bug where a controlled number input fights the user while typing.
 */
export function useProfileForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});

  function updateField<K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof ProfileFormState, string>> = {};

    const nameError = validateRequired(form.name, 'Name');
    if (nameError) nextErrors.name = nameError;

    const ageError = validateNumberInRange(Number(form.age), 13, 100, 'Age');
    if (ageError) nextErrors.age = ageError;

    const heightError = validateNumberInRange(Number(form.heightCm), 100, 250, 'Height (cm)');
    if (heightError) nextErrors.heightCm = heightError;

    const weightError = validateNumberInRange(Number(form.weightKg), 30, 300, 'Weight (kg)');
    if (weightError) nextErrors.weightKg = weightError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    saveProfile({
      name: form.name.trim(),
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      goal: form.goal,
      fitnessLevel: form.fitnessLevel,
      equipmentAccess: form.equipmentAccess,
    });

    navigate(ROUTES.plan);
  }

  return { form, errors, updateField, handleSubmit };
}
