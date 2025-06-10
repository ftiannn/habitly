/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Habit } from '@/types';

export const useHabits = () => {
  return useQuery<Habit[]>({
    queryKey: queryKeys.habits,
    queryFn: api.habits.getAll,
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Always refetch when component mounts
    gcTime: 0, // Don't cache data (was cacheTime in v4)
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.habits.create,
    onMutate: async (newHabit) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits });
      const previousHabits = queryClient.getQueryData(queryKeys.habits);
      
      queryClient.setQueryData(queryKeys.habits, (old: any) => {
        return old ? [...old, { ...newHabit, id: Date.now() }] : [newHabit];
      });
      
      return { previousHabits };
    },
    onError: (err, newHabit, context) => {
      toast.error('Failed to create habit.');
    },
    onSuccess: async () => {
      // Invalidate and immediately refetch the habits data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.habits }),
        queryClient.refetchQueries({ queryKey: queryKeys.habits })
      ]);
      toast.success('Habit created!');
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.habits.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      toast.success('Habit updated!');
    },
    onError: () => toast.error('Failed to update habit'),
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.habits.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      toast.success('Habit deleted!');
    },
    onError: () => toast.error('Failed to delete habit'),
  });
};

export const useToggleHabitCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: number; date?: string }) => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      return api.habits.toggleCompletion({habitId, date: targetDate});
    },
    onMutate: async ({ habitId, date }) => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      await queryClient.cancelQueries({ queryKey: queryKeys.habits });
      
      const previousHabits = queryClient.getQueryData<Habit[]>(queryKeys.habits);
      
      queryClient.setQueryData<Habit[]>(queryKeys.habits, (old: any) => {
        if (!old) return old;
        
        return old.map((habit) => {
          if (habit.id !== habitId) return habit;
          
          const completions = habit.completions || [];
          const targetDateTime = new Date(targetDate);
          const existingCompletion = completions.find((completion) => {
            const completedDate = new Date(completion.completedAt);
            return completedDate.toDateString() === targetDateTime.toDateString();
          });
          
          if (existingCompletion) {
            // Remove the completion (toggle off)
            return {
              ...habit,
              completions: completions.filter((completion) => {
                const completedDate = new Date(completion.completedAt);
                return completedDate.toDateString() !== targetDateTime.toDateString();
              }),
            };
          } else {
            // Add new completion (toggle on)
            return {
              ...habit,
              completions: [...completions, { 
                id: Date.now(), // Temporary ID for optimistic update
                habitId: habitId,
                completedAt: targetDateTime.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }],
            };
          }
        });
      });
      
      return { previousHabits };
    },
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(queryKeys.habits, context.previousHabits);
      }
      toast.error('Failed to update habit');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      // Invalidate badges to check for new badge progress/completions
      queryClient.invalidateQueries({ queryKey: queryKeys.user.badges });
    },
  });
};

export const useHabitHistory = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['habits', 'history', startDate, endDate],
    queryFn: () => api.habits.getHistory(startDate, endDate),
    staleTime: 30 * 60 * 1000,
    enabled: !!startDate && !!endDate,
  });
};
