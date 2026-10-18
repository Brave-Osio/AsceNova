import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listAdminUsers } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';
import type { AccountStatus, UserRole } from '../../../types/admin.types';

const PAGE_SIZE = 20;

export interface AdminUserListFilters {
  search: string;
  status: AccountStatus | undefined;
}

/**
 * One role's slice of the user list (the admin page shows one section per role). Search and status are
 * shared across sections; each section pages independently, and returns to page 1 when a filter changes.
 */
export function useAdminUsers(role: UserRole, { search, status }: AdminUserListFilters) {
  const filterKey = `${search}|${status ?? ''}`;
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const page = pageState.filterKey === filterKey ? pageState.page : 1;

  const filters = { search: search || undefined, status, role, page, pageSize: PAGE_SIZE };

  const query = useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => listAdminUsers(filters),
    placeholderData: keepPreviousData,
  });

  return {
    result: query.data,
    isLoading: query.isLoading,
    page,
    setPage: (next: number) => setPageState({ filterKey, page: next }),
    pageSize: PAGE_SIZE,
  };
}
