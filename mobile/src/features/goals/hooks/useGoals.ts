import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { listGoals } from '../../../services/goalService';
import { queryKeys } from '../../../lib/queryKeys';

/** Mirrors the web app's useGoals.ts. */
export function useGoals() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.goals.list(user?.id ?? ''),
    queryFn: listGoals,
    enabled: !!user?.id,
  });

  return { goals: query.data ?? [], isLoading: query.isLoading };
}
