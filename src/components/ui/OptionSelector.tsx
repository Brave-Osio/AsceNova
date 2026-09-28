interface OptionSelectorProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export default function OptionSelector<T extends string>({
  label,
  value,
  options,
  onChange,
}: OptionSelectorProps<T>) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-border bg-brand-card text-brand-text-secondary hover:border-white/20 hover:text-brand-text'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
