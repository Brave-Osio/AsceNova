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
      <span className="mb-1 block text-sm font-medium text-gray-300">{label}</span>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
          error ? 'border-red-500' : 'border-white/10'
        }`}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-400">{error}</span>
      ) : helperText ? (
        <span className="mt-1 block text-xs text-gray-500">{helperText}</span>
      ) : null}
    </label>
  );
});

export default TextField;
