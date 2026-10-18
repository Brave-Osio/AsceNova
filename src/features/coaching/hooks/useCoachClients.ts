import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listCoachClients } from '../../../services/coachingService';
import { queryKeys } from '../../../lib/queryKeys';

const PAGE_SIZE = 20;

export function useCoachClients() {
  const [search, setSearchState] = useState('');
  const [page, setPage] = useState(1);

  const filters = { search: search || undefined, page, pageSize: PAGE_SIZE };

  const query = useQuery({
    queryKey: queryKeys.coaching.clients(filters),
    queryFn: () => listCoachClients(filters),
    placeholderData: keepPreviousData,
    // Every fetch is written to the audit log, so don't refetch just because the tab regained focus.
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  function setSearch(value: string) {
    setSearchState(value);
    setPage(1);
  }

  return {
    result: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    search,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  };
}
