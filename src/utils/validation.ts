/**
 * Each validator returns an error message string, or null if valid.
 * Pure functions so they're trivially unit-testable and reusable by
 * any future form (e.g. an edit-profile screen) without duplicating rules.
 */

export function validateRequired(value: string, fieldLabel: string): string | null {
  return value.trim().length === 0 ? `${fieldLabel} is required.` : null;
}

export function validateNumberInRange(
  value: number,
  min: number,
  max: number,
  fieldLabel: string,
): string | null {
  if (Number.isNaN(value)) return `${fieldLabel} must be a number.`;
  if (value < min || value > max) {
    return `${fieldLabel} must be between ${min} and ${max}.`;
  }
  return null;
}
