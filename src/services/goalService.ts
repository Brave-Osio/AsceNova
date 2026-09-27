import { httpClient } from '../lib/httpClient';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../types/goal.types';

/** Thin wrapper over /api/goals, mirroring challengeService.ts's convention. */
export async function listGoals(): Promise<Goal[]> {
  const res = await httpClient.get<{ goals: Goal[] }>('/api/goals');
  return res.data.goals;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const res = await httpClient.post<{ goal: Goal }>('/api/goals', input);
  return res.data.goal;
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<void> {
  await httpClient.patch(`/api/goals/${id}`, input);
}

export async function completeGoal(id: string): Promise<Goal> {
  const res = await httpClient.post<{ goal: Goal }>(`/api/goals/${id}/complete`);
  return res.data.goal;
}

export async function abandonGoal(id: string): Promise<void> {
  await httpClient.post(`/api/goals/${id}/abandon`);
}
