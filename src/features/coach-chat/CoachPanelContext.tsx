import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface CoachPanelValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CoachPanelContext = createContext<CoachPanelValue | null>(null);

/** Open/closed state for the floating AI coach side panel, shared by the launcher, the panel, and the dashboard teaser. */
export function CoachPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);
  return <CoachPanelContext.Provider value={value}>{children}</CoachPanelContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCoachPanel(): CoachPanelValue {
  const ctx = useContext(CoachPanelContext);
  if (!ctx) throw new Error('useCoachPanel must be used inside CoachPanelProvider');
  return ctx;
}
