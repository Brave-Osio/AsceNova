import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../../lib/queryClient';
import ErrorBoundary from '../../components/system/ErrorBoundary';
import ToastHost from '../../components/system/ToastHost';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

/**
 * Single place to add future app-wide providers without App.tsx
 * accumulating a deepening wrapper pyramid. UserProgressProvider used to
 * sit here (Phase 1) but is gone now that gamification is fully
 * backend-driven via React Query (useUserProgress) — no context needed.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <ToastHost />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
