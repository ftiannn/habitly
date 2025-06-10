import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { api } from '@/lib/api';

export const useBadges = () => {
  return useQuery({
    queryKey: queryKeys.user.badges,
    queryFn: api.badges.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
};

export const useBadgeDefinitions = () => {
  return useQuery({
    queryKey: queryKeys.badges,
    queryFn: api.badges.getDefinitions,
    staleTime: 10 * 60 * 1000, // 10 minutes cache - definitions don't change often
    refetchOnWindowFocus: false,
  });
};