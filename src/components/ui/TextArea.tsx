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
      <span className="mb-1 block text-sm font-medium text-gray-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </label>
  );
}
