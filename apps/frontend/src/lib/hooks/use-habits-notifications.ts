import { useEffect, useRef } from 'react';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useToggleHabitCompletion } from './use-habits';
import { habitNotificationService } from '@/services/notifications/notification.service';

export const useHabitsWithNotifications = () => {
  const habitsQuery = useHabits();
  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const toggleCompletionMutation = useToggleHabitCompletion();
  const notificationsInitialized = useRef(false);

  useEffect(() => {
    if (!notificationsInitialized.current) {
      habitNotificationService.initialize().then((success) => {
        notificationsInitialized.current = success;
      });
    }
  }, []);

  useEffect(() => {
    if (habitsQuery.data && notificationsInitialized.current) {
      habitNotificationService.scheduleAllHabitNotifications(habitsQuery.data)
        .catch(error => console.error('Failed to update notifications:', error));
    }
  }, [habitsQuery.data]);

  const toggleHabitCompletionWithNotifications = async (params: { habitId: number; date?: string }) => {
    try {
      const result = await toggleCompletionMutation.mutateAsync(params);
      
      if (habitsQuery.data) {
        await habitNotificationService.scheduleAllHabitNotifications(habitsQuery.data);
      }
      
      return result;
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  };

  return {
    ...habitsQuery,
    toggleHabitCompletion: toggleHabitCompletionWithNotifications,
    createHabit: createHabitMutation,
    updateHabit: updateHabitMutation,
    deleteHabit: deleteHabitMutation,
    sendTestNotification: habitNotificationService.sendTestNotification,
    refreshNotifications: () => {
      if (habitsQuery.data) {
        return habitNotificationService.scheduleAllHabitNotifications(habitsQuery.data);
      }
    }
  };
};