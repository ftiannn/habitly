import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: api.user.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
};

export const useUserSettings = () => {
  return useQuery({
    queryKey: queryKeys.user.settings,
    queryFn: api.user.getSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes cache - settings don't change often
    refetchOnWindowFocus: false,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.user.updateProfile,
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.profile });
      const previousProfile = queryClient.getQueryData(queryKeys.user.profile);
      
      queryClient.setQueryData(queryKeys.user.profile, (old: unknown) => ({
        ...(old as object),
        ...newProfile
      }));
      
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.user.profile, context.previousProfile);
      }
      toast.error('Failed to update profile');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
    },
    onSuccess: () => {
      toast.success('Profile updated!');
    },
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.user.updateSettings,
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.settings });
      const previousSettings = queryClient.getQueryData(queryKeys.user.settings);
      
      queryClient.setQueryData(queryKeys.user.settings, (old: unknown) => ({
        ...(old as object),
        ...newSettings
      }));
      
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.user.settings, context.previousSettings);
      }
      toast.error('Failed to update settings');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.settings });
    },
    onSuccess: () => {
      toast.success('Settings updated!');
    },
  });
};