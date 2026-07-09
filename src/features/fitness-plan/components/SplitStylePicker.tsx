import { SPLIT_STYLE_OPTIONS } from '../../../types/plan.types';
import type { WorkoutSplitStyle } from '../../../types/plan.types';

interface SplitStylePickerProps {
  selected: WorkoutSplitStyle;
  onSelect: (style: WorkoutSplitStyle) => void;
}

export default function SplitStylePicker({ selected, onSelect }: SplitStylePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {SPLIT_STYLE_OPTIONS.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              isSelected
                ? 'border-violet-500 bg-violet-500/15'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
              {option.label}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
          </button>
        );
      })}
    </div>
  );
}
