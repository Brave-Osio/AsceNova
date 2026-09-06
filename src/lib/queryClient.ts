import { QueryClient } from '@tanstack/react-query';
import { showErrorToast } from './toast';

/**
 * Single shared QueryClient. Defaults favor a stable demo/defense
 * experience over aggressive background refetching.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.action.type === 'error') {
    const meta = event.query.meta;
    if (!meta?.silent) {
      showErrorToast(event.action.error);
    }
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === 'updated' && event.action.type === 'error') {
    const meta = event.mutation.meta;
    if (!meta?.silent) {
      showErrorToast(event.action.error);
    }
  }
});
