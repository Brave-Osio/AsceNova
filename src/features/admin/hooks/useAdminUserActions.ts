import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  suspendUser as suspendUserRequest,
  reactivateUser as reactivateUserRequest,
  deleteUser as deleteUserRequest,
  grantAdmin as grantAdminRequest,
  revokeAdmin as revokeAdminRequest,
  exportUsersCsv as exportUsersCsvRequest,
} from '../../../services/adminService';
import { queryKeys } from '../../../lib/queryKeys';
import { showErrorToast, showSuccessToast } from '../../../lib/toast';

/**
 * Hand-rolled manual-async pattern (mirrors useDailyLog.ts) rather than
 * useMutation — needs per-action loading state and a shared invalidation
 * step across four different mutations.
 */
export function useAdminUserActions() {
  const queryClient = useQueryClient();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  function invalidate(userId?: string) {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetail(userId) });
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
  }

  async function suspendUser(userId: string) {
    setPendingUserId(userId);
    try {
      await suspendUserRequest(userId);
      invalidate(userId);
      showSuccessToast('User suspended');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingUserId(null);
    }
  }

  async function reactivateUser(userId: string) {
    setPendingUserId(userId);
    try {
      await reactivateUserRequest(userId);
      invalidate(userId);
      showSuccessToast('User reactivated');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingUserId(null);
    }
  }

  async function deleteUser(userId: string) {
    setPendingUserId(userId);
    try {
      await deleteUserRequest(userId);
      invalidate(userId);
      showSuccessToast('User deleted');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingUserId(null);
    }
  }

  async function setAdminAccess(userId: string, makeAdmin: boolean) {
    setPendingUserId(userId);
    try {
      await (makeAdmin ? grantAdminRequest(userId) : revokeAdminRequest(userId));
      invalidate(userId);
      showSuccessToast(makeAdmin ? 'Administrator access granted' : 'Administrator access revoked');
    } catch (err) {
      showErrorToast(err);
    } finally {
      setPendingUserId(null);
    }
  }

  async function exportCsv() {
    try {
      await exportUsersCsvRequest();
    } catch (err) {
      showErrorToast(err);
    }
  }

  return { suspendUser, reactivateUser, deleteUser, setAdminAccess, exportCsv, pendingUserId };
}
