import { Eye, EyeOff } from 'lucide-react';

const BUTTON =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-brand-text-muted transition-colors hover:bg-brand-card-alt hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 active:scale-95';

/** Footer row for a card: Hide when visible, Unhide when shown via "Show hidden". */
export function HideButton({ isHidden, onHide, onUnhide }: { isHidden: boolean; onHide: () => void; onUnhide: () => void }) {
  return (
    <div className="mt-4 flex justify-end border-t border-brand-border pt-3">
      {isHidden ? (
        <button type="button" onClick={onUnhide} className={BUTTON}>
          <Eye size={13} aria-hidden="true" /> Unhide
        </button>
      ) : (
        <button type="button" onClick={onHide} className={BUTTON}>
          <EyeOff size={13} aria-hidden="true" /> Hide
        </button>
      )}
    </div>
  );
}

/** "Show hidden (n)" / "Hide hidden" switch for a list; renders nothing when there are no hidden items. */
export function ShowHiddenToggle({ count, showing, onToggle }: { count: number; showing: boolean; onToggle: () => void }) {
  if (count === 0) return null;
  return (
    <div className="flex justify-end">
      <button type="button" onClick={onToggle} aria-pressed={showing} className={`${BUTTON} border border-brand-border bg-brand-card`}>
        {showing ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
        {showing ? 'Hide hidden' : `Show hidden (${count})`}
      </button>
    </div>
  );
}
