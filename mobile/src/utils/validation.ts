/** Mirrors the web app's src/utils/validation.ts. */
export function validateNumberInRange(value: number, min: number, max: number, fieldLabel: string): string | null {
  if (Number.isNaN(value)) return `${fieldLabel} must be a number.`;
  if (value < min || value > max) {
    return `${fieldLabel} must be between ${min} and ${max}.`;
  }
  return null;
}
