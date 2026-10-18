import { httpClient } from '../lib/httpClient';
import type { ClientDashboard, CoachClientFilters, CoachClientListResult } from '../types/coaching.types';

/**
 * Mirrors the web app's src/services/coachingService.ts: the /api/coach endpoints (a coach supervising
 * human clients). Not to be confused with coachService.ts, which is the AI coach chat.
 */
export async function listCoachClients(filters: CoachClientFilters): Promise<CoachClientListResult> {
  const res = await httpClient.get<CoachClientListResult>('/api/coach/clients', { params: filters });
  return res.data;
}

export async function getClientDashboard(clientId: string): Promise<ClientDashboard> {
  const res = await httpClient.get<ClientDashboard>(`/api/coach/clients/${clientId}/dashboard`);
  return res.data;
}
