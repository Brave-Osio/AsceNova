import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getMyProfile } from '../../../services/profileService';
import { queryKeys } from '../../../lib/queryKeys';

/** Mirrors the web app's useProfile.ts. */
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile.detail(user?.id ?? ''),
    queryFn: getMyProfile,
    enabled: !!user?.id,
  });
}
