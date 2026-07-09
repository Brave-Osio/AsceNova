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
      <span className="mb-1 block text-sm font-medium text-gray-300">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-violet-500 bg-violet-500/20 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
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
