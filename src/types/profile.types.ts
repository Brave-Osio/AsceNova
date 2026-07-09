export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintain_weight';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentAccess = 'home' | 'gym' | 'both';

export interface Profile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  equipmentAccess: EquipmentAccess;
  createdAt: string; // ISO timestamp — set once on creation
}

/**
 * Input shape for creating a profile, before createdAt is stamped.
 * Kept separate from Profile so the form layer never has to fake a timestamp.
 */
export type ProfileInput = Omit<Profile, 'createdAt'>;
