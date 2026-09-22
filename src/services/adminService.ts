import { httpClient } from '../lib/httpClient';
import type { AdminStats, AdminUserDetail, AdminUserFilters, AdminUserListResult } from '../types/admin.types';

/**
 * Thin wrapper over the /api/admin endpoints, mirroring notificationService.ts's
 * "one exported function per concern" convention.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const res = await httpClient.get<AdminStats>('/api/admin/stats');
  return res.data;
}

export async function listAdminUsers(filters: AdminUserFilters): Promise<AdminUserListResult> {
  const res = await httpClient.get<AdminUserListResult>('/api/admin/users', { params: filters });
  return res.data;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const res = await httpClient.get<AdminUserDetail>(`/api/admin/users/${userId}`);
  return res.data;
}

export async function suspendUser(userId: string): Promise<void> {
  await httpClient.post(`/api/admin/users/${userId}/suspend`);
}

export async function reactivateUser(userId: string): Promise<void> {
  await httpClient.post(`/api/admin/users/${userId}/reactivate`);
}

export async function deleteUser(userId: string): Promise<void> {
  await httpClient.delete(`/api/admin/users/${userId}`);
}

/**
 * Triggers a browser download rather than returning a URL — the export
 * endpoint requires the Authorization header the axios interceptor
 * attaches, so a plain <a href> can't carry it.
 */
export async function exportUsersCsv(): Promise<void> {
  const res = await httpClient.get('/api/admin/users/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'users.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
