export type BmiCategory = 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';

export interface BmiResult {
  value: number;
  category: BmiCategory;
}

const MIN_HEIGHT_CM = 50;
const MAX_HEIGHT_CM = 280;
const MIN_WEIGHT_KG = 10;
const MAX_WEIGHT_KG = 700;

/** BMI = kg / m², rounded to 1 decimal. Returns null for missing, non-finite or implausible inputs. */
export function calculateBmi(heightCm: unknown, weightKg: unknown): BmiResult | null {
  if (typeof heightCm !== 'number' || typeof weightKg !== 'number') return null;
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return null;
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) return null;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) return null;

  const meters = heightCm / 100;
  const value = Math.round((weightKg / (meters * meters)) * 10) / 10;
  return { value, category: classifyBmi(weightKg / (meters * meters)) };
}

/** Standard adult cut-offs: <18.5, 18.5–<25, 25–<30, ≥30. Classifies the unrounded value. */
export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi < 25) return 'NORMAL';
  if (bmi < 30) return 'OVERWEIGHT';
  return 'OBESE';
}
