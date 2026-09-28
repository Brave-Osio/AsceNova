import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  /** 'icon' for a compact button (navbar); 'row' for a labeled row (mobile "More" sheet). */
  variant?: 'icon' | 'row';
}

export default function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex w-full items-center justify-between rounded-xl bg-brand-card px-4 py-3 text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text"
      >
        <span className="flex items-center gap-2">
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
        <span
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${isDark ? 'bg-brand-card-alt' : 'bg-brand-primary'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${isDark ? 'translate-x-0.5' : 'translate-x-5'}`}
          />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-card text-brand-text-secondary hover:bg-brand-card-alt transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
