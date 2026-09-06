import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../../lib/queryClient';
import ErrorBoundary from '../../components/system/ErrorBoundary';
import ToastHost from '../../components/system/ToastHost';
import { AuthProvider } from '../../context/AuthContext';
import { UserProgressProvider } from '../../context/UserProgressContext';

/**
 * Single place to add future app-wide providers without App.tsx
 * accumulating a deepening wrapper pyramid. AuthProvider sits above
 * UserProgressProvider since progress/profile queries will need the
 * authenticated userId once Phase 2 migrates them off localStorage.
 * UserProgressProvider itself still reads/writes localStorage
 * internally at this stage — only the surrounding infra is new here.
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserProgressProvider>
            {children}
            <ToastHost />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </UserProgressProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
