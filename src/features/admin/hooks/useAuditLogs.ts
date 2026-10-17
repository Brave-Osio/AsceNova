import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listAuditLogs } from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';
import type { AuditAction, AuditOutcome } from '../../../types/admin.types';

const PAGE_SIZE = 20;

export interface AuditLogFilterState {
  actor: string;
  action: AuditAction | '';
  outcome: AuditOutcome | '';
  /** Local calendar days (YYYY-MM-DD) picked in the UI. */
  fromDay: string;
  toDay: string;
}

const EMPTY_FILTERS: AuditLogFilterState = { actor: '', action: '', outcome: '', fromDay: '', toDay: '' };

/** A picked calendar day is interpreted in the viewer's local time, then sent to the API as UTC instants. */
function startOfLocalDayIso(day: string): string {
  return new Date(`${day}T00:00:00`).toISOString();
}
function endOfLocalDayIso(day: string): string {
  return new Date(`${day}T23:59:59.999`).toISOString();
}

export function useAuditLogs() {
  const [filters, setFiltersState] = useState<AuditLogFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const params = {
    actor: filters.actor.trim() || undefined,
    action: filters.action || undefined,
    outcome: filters.outcome || undefined,
    from: filters.fromDay ? startOfLocalDayIso(filters.fromDay) : undefined,
    to: filters.toDay ? endOfLocalDayIso(filters.toDay) : undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const query = useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => listAuditLogs(params),
    placeholderData: keepPreviousData,
  });

  function setFilters(next: Partial<AuditLogFilterState>) {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setPage(1);
  }

  function resetFilters() {
    setFiltersState(EMPTY_FILTERS);
    setPage(1);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const rangeIsInvalid = !!filters.fromDay && !!filters.toDay && filters.fromDay > filters.toDay;

  return {
    result: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    rangeIsInvalid,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  };
}
