import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listAdminUsers } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';
import type { AccountStatus } from '../../../types/admin.types';

const PAGE_SIZE = 20;

export function useAdminUsers() {
  const [search, setSearchState] = useState('');
  const [status, setStatusState] = useState<AccountStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  const filters = { search: search || undefined, status, page, pageSize: PAGE_SIZE };

  const query = useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => listAdminUsers(filters),
    placeholderData: keepPreviousData,
  });

  function setSearch(value: string) {
    setSearchState(value);
    setPage(1);
  }

  function setStatus(value: AccountStatus | undefined) {
    setStatusState(value);
    setPage(1);
  }

  return {
    result: query.data,
    isLoading: query.isLoading,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  };
}
