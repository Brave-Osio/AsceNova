import { useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  label: string;
  /** Disabled tooltips render children untouched (e.g. expanded sidebar, where labels are visible). */
  disabled?: boolean;
  /** `right` centers beside the trigger (sidebar rail); `bottom` sits under it, left-aligned (top-bar buttons near the viewport edge). */
  side?: 'right' | 'bottom';
  children: ReactNode;
}

/**
 * Tooltip shown on hover and keyboard focus. Rendered in a portal with fixed
 * positioning so scrolling/overflow containers (the sidebar nav) can't clip it.
 */
export default function Tooltip({ label, disabled = false, side = 'right', children }: TooltipProps) {
  const id = useId();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  if (disabled) return <>{children}</>;

  function show(e: React.SyntheticEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos(
      side === 'right'
        ? { top: rect.top + rect.height / 2, left: rect.right + 10 }
        : { top: rect.bottom + 8, left: Math.max(8, rect.left) },
    );
  }
  const hide = () => setPos(null);

  return (
    <span
      className={side === 'right' ? 'block' : 'inline-block'}
      aria-describedby={pos ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ top: pos.top, left: pos.left }}
            className={`pointer-events-none fixed z-[70] whitespace-nowrap rounded-lg border border-brand-border bg-brand-card px-2.5 py-1.5 text-xs font-semibold text-brand-text shadow-lg ${
              side === 'right' ? '-translate-y-1/2' : ''
            }`}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
