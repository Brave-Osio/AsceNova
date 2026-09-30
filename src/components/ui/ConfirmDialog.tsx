import { useEffect, useRef, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Extra emphasized line, e.g. a "you've tried this several times" warning. */
  warning?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shared confirmation modal. Cancel is auto-focused (the safe default),
 * Escape / backdrop click cancel, and both buttons are locked while the
 * confirmed action is in flight so it can't be submitted twice.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  warning,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.querySelector('button')?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) onCancel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={isLoading ? undefined : onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="card relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 light:text-amber-700">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-bold text-brand-text">
              {title}
            </h2>
            <div className="mt-1 text-sm text-brand-text-secondary">{description}</div>
            {warning && (
              <p className="mt-2 text-sm font-semibold text-amber-400 light:text-amber-700" role="alert">
                {warning}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <div ref={cancelRef}>
            <Button variant="secondary" size="sm" disabled={isLoading} onClick={onCancel}>
              {cancelLabel}
            </Button>
          </div>
          <Button size="sm" loading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
