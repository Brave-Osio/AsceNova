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
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, value, onChange, type = 'text', error, helperText, placeholder, onBlur },
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
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-brand-card px-4 py-2.5 text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/60 ${
          error ? 'border-red-500' : 'border-brand-border'
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-400">{error}</span>
      ) : helperText ? (
        <span className="mt-1 block text-xs text-brand-text-muted">{helperText}</span>
      ) : null}
    </label>
  );
});

export default TextField;
