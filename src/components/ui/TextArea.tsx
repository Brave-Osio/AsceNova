interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function TextArea({ label, value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-text-secondary">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-brand-border bg-brand-card px-4 py-2.5 text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
      />
    </label>
  );
}
