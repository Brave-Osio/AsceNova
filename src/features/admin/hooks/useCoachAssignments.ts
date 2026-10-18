import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignClient as assignClientRequest,
  unassignClient as unassignClientRequest,
  listAdminCoachClients,
  listCoaches,
} from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';

export function useCoaches() {
  const query = useQuery({ queryKey: queryKeys.admin.coaches(), queryFn: listCoaches });
  return { coaches: query.data ?? [], isLoading: query.isLoading };
}

export function useAdminCoachClients(coachId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.admin.coachClients(coachId ?? ''),
    queryFn: () => listAdminCoachClients(coachId ?? ''),
    enabled: !!coachId,
  });
  return { clients: query.data ?? [], isLoading: query.isLoading };
}

/** Assign / unassign with one shared pending flag and invalidation (same manual-async style as useAdminUserActions). */
export function useCoachAssignmentActions() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  function invalidate(coachId: string, clientId: string) {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.coaches() });
    queryClient.invalidateQueries({ queryKey: ['admin', 'coach-clients'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(coachId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(clientId) });
  }

  async function run(coachId: string, clientId: string, request: () => Promise<void>, message: string) {
    setIsPending(true);
    try {
      await request();
      invalidate(coachId, clientId);
      showSuccessToast(message);
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsPending(false);
    }
  }

  return {
    isPending,
    assign: (coachId: string, clientId: string) =>
      run(coachId, clientId, () => assignClientRequest(coachId, clientId), 'Client assigned'),
    unassign: (coachId: string, clientId: string) =>
      run(coachId, clientId, () => unassignClientRequest(coachId, clientId), 'Client unassigned'),
  };
}
