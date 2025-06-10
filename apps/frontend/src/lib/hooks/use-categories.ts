import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { api } from '@/lib/api';

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.categories.getAll,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};