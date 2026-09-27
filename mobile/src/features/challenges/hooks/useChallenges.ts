import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getChallengeCatalog, getMyChallenges } from '../../../services/challengeService';
import { queryKeys } from '../../../lib/queryKeys';

/** Mirrors the web app's useChallenges.ts. */
export function useChallenges() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? '';

  const catalogQuery = useQuery({
    queryKey: queryKeys.challenges.catalog(),
    queryFn: getChallengeCatalog,
    enabled: isAuthenticated,
  });

  const mineQuery = useQuery({
    queryKey: queryKeys.challenges.mine(userId),
    queryFn: getMyChallenges,
    enabled: isAuthenticated,
  });

  return {
    catalog: catalogQuery.data ?? [],
    invites: mineQuery.data ?? [],
    isLoading: catalogQuery.isLoading || mineQuery.isLoading,
  };
}
