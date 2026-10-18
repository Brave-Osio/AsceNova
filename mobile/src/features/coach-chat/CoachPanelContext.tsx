import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface CoachPanelValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CoachPanelContext = createContext<CoachPanelValue | null>(null);

/** Mirrors the web's CoachPanelContext: open/closed state for the floating AI coach panel, shared by the top-bar launcher, the panel, and the dashboard teaser. */
export function CoachPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <CoachPanelContext.Provider value={value}>{children}</CoachPanelContext.Provider>;
}

export function useCoachPanel(): CoachPanelValue {
  const ctx = useContext(CoachPanelContext);
  if (!ctx) throw new Error('useCoachPanel must be used inside CoachPanelProvider');
  return ctx;
}
