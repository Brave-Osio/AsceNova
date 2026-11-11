import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import Button from './Button';
import { modalBackdrop, modalPanel } from '../../lib/motion';

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}

/**
 * Inactivity warning. Escape and backdrop click both mean "stay signed in" — the safe, non-destructive
 * choice — and the primary button is auto-focused so Enter keeps the session too.
 */
export default function SessionTimeoutDialog({ isOpen, secondsLeft, onStay, onLogout }: SessionTimeoutDialogProps) {
  const stayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    stayRef.current?.querySelector('button')?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onStay();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onStay]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onStay}
          />
          <motion.div
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-timeout-title"
            aria-describedby="session-timeout-desc"
            className="card relative w-full max-w-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 light:text-amber-700">
                <Clock size={18} />
              </span>
              <div>
                <h2 id="session-timeout-title" className="text-base font-bold text-brand-text">
                  Still there?
                </h2>
                <p id="session-timeout-desc" className="mt-1 text-sm text-brand-text-secondary">
                  You&apos;ve been inactive for a while. For your security you&apos;ll be logged out in{' '}
                  <span className="font-semibold text-amber-400 light:text-amber-700">{secondsLeft}s</span>.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onLogout}>
                Log out now
              </Button>
              <div ref={stayRef}>
                <Button size="sm" onClick={onStay}>
                  Stay signed in
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
