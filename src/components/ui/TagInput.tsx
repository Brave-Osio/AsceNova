import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

/**
 * Free-form chip input for array fields with no fixed option set (e.g.
 * food allergies, medical restrictions) — OptionSelector/Checkbox are
 * both single-value and don't fit these.
 */
export default function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">{label}</span>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-primary/60">
        {value.map((tag) => (
          <span
            key={tag}
            className="chip chip-primary px-2.5 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-brand-primary-light hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-brand-text placeholder:text-brand-text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
