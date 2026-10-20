import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listCoachClients } from '../../../services/coachingService';
import { queryKeys } from '../../../lib/queryKeys';
import { DEFAULT_PAGE_SIZE } from '../../../constants/pagination';

export function useCoachClients() {
  const [search, setSearchState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const filters = { search: search || undefined, page, pageSize };

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

  function setPageSize(value: number) {
    setPageSizeState(value);
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
    pageSize,
    setPageSize,
  };
}
