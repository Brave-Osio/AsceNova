import type { ReactNode } from 'react';
import { UserProgressProvider } from '../../context/UserProgressContext';

/**
 * Single place to add future app-wide providers (theme, toast, etc.)
 * without App.tsx accumulating a deepening wrapper pyramid.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return <UserProgressProvider>{children}</UserProgressProvider>;
}
