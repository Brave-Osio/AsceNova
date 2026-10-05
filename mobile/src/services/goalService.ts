import { httpClient } from '../lib/httpClient';
import type { Goal, CreateGoalInput } from '../types/goal.types';

/** Thin wrapper over /api/goals, mirroring the web's goalService.ts. */
export async function listGoals(): Promise<Goal[]> {
  const res = await httpClient.get<{ goals: Goal[] }>('/api/goals');
  return res.data.goals;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const res = await httpClient.post<{ goal: Goal }>('/api/goals', input);
  return res.data.goal;
}

export async function completeGoal(id: string): Promise<Goal> {
  const res = await httpClient.post<{ goal: Goal }>(`/api/goals/${id}/complete`);
  return res.data.goal;
}

export async function abandonGoal(id: string): Promise<void> {
  await httpClient.post(`/api/goals/${id}/abandon`);
}
