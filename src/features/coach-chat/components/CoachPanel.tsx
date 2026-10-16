import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useCoachChat } from '../hooks/useCoachChat';
import { useCoachPanel } from '../CoachPanelContext';
import { MOTION_DURATION, MOTION_EASE } from '../../../lib/motion';

/**
 * Floating launcher plus right-side chat drawer, mounted once in Layout so the
 * conversation (and any in-flight request) survives opening, closing and
 * navigating between pages.
 */
export default function CoachPanel() {
  const { isOpen, open, close } = useCoachPanel();
  const chat = useCoachChat();

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="launcher"
            type="button"
            onClick={open}
            aria-label="Open AI coach chat"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="fixed right-3 top-1.5 z-40 flex h-11 w-11 items-center justify-center sm:right-4 sm:top-2 rounded-full bg-brand-primary text-white shadow-md shadow-brand-primary/30 transition-colors hover:bg-brand-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg"
          >
            <Bot size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION_DURATION.base }}
              onClick={close}
              aria-hidden="true"
              className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            />
            <motion.aside
              key="panel"
              role="dialog"
              aria-label="AI Fitness Coach"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l border-brand-border bg-brand-surface shadow-2xl sm:w-[26rem]"
            >
              <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-brand-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary-light">
                    <Bot size={20} />
                    <span className="pulse-dot absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-surface bg-green-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-brand-text">AI Fitness Coach</h2>
                    <p className="text-xs text-brand-text-muted">Knows your goals and progress</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close AI coach chat"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-card-alt hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
                >
                  <X size={16} />
                </button>
              </header>
              <ChatWindow chat={chat} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
