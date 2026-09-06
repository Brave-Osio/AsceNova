import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getMyProfile } from '../../../services/profileService';
import { queryKeys } from '../../../lib/queryKeys';

/**
 * Replaces the old synchronous getProfile()/localStorage read. `data`
 * is `null` (not an error) when the signed-in user hasn't set up a
 * profile yet — callers keep the same "no profile → empty state" check
 * they already had, just driven by isLoading/data instead of a sync call.
 */
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile.detail(user?.id ?? ''),
    queryFn: getMyProfile,
    enabled: !!user?.id,
  });
}
