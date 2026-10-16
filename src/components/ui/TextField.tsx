import { forwardRef } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'password' | 'date';
  error?: string;
  helperText?: string;
  placeholder?: string;
  onBlur?: () => void;
  /** Native constraints: give the browser's own spinner/date picker the same limits the validators enforce. */
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, value, onChange, type = 'text', error, helperText, placeholder, onBlur, min, max, step },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">{label}</span>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        min={min}
        max={max}
        step={step}
        inputMode={type === 'number' ? 'decimal' : undefined}
        aria-invalid={error ? true : undefined}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-brand-card px-4 py-2.5 text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/60 ${
          error ? 'border-red-500' : 'border-brand-border'
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-400 light:text-red-700">{error}</span>
      ) : helperText ? (
        <span className="mt-1 block text-xs text-brand-text-muted">{helperText}</span>
      ) : null}
    </label>
  );
});

export default TextField;
