/**
 * Each validator returns an error message string, or null if valid.
 * Pure functions so they're trivially unit-testable and reusable by
 * any future form (e.g. an edit-profile screen) without duplicating rules.
 */

export function validateRequired(value: string, fieldLabel: string): string | null {
  return value.trim().length === 0 ? `${fieldLabel} is required.` : null;
}

/**
 * Body-weight entry (daily log, goal target): a required positive number in a
 * realistic kg range. Rejects empty, non-numeric, negative and absurd values
 * with a field-specific message instead of coercing them.
 */
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 300;

export function validateWeightKg(raw: string, fieldLabel = 'Weight'): string | null {
  const text = raw.trim();
  if (text === '') return `${fieldLabel} is required.`;
  const value = Number(text);
  if (!Number.isFinite(value)) return `${fieldLabel} must be a number.`;
  if (value < 0) return `${fieldLabel} cannot be negative.`;
  if (value < WEIGHT_KG_MIN || value > WEIGHT_KG_MAX) {
    return `${fieldLabel} must be between ${WEIGHT_KG_MIN} and ${WEIGHT_KG_MAX} kg.`;
  }
  return null;
}

/** `dateString` and `todayString` are YYYY-MM-DD, so plain string comparison orders them correctly. */
export function validateNotPastDate(dateString: string, todayString: string, fieldLabel = 'Date'): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString) || Number.isNaN(Date.parse(dateString))) {
    return `Enter a valid ${fieldLabel.toLowerCase()}.`;
  }
  if (dateString < todayString) return `${fieldLabel} cannot be in the past.`;
  return null;
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
