import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      placeholderData: (previousData) => previousData,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  habits: ['habits'] as const,
  badges: ['badges'] as const,
  user: {
    profile: ['user', 'profile'] as const,
    settings: ['user', 'settings'] as const,
    badges: ['user', 'badges'] as const
  },
  categories: ['categories'] as const,
} as const;

export { preloader } from './preloader';