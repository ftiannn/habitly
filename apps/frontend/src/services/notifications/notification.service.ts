import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import type { Habit } from '@/types';

export class habitNotificationService {
  private static readonly HABIT_ID_MULTIPLIER = 1000;

  static async initialize(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        return false;
      }

      await this.setupNotificationListeners();
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  static async scheduleAllHabitNotifications(habits: Habit[]): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await this.cancelAllNotifications();

      const eligibleHabits = this.getEligibleHabits(habits);

      if (eligibleHabits.length === 0) {
        return;
      }

      const notifications: LocalNotificationSchema[] = [];

      for (const habit of eligibleHabits) {
        const notification = this.createNotificationForHabit(habit);
        if (notification) {
          notifications.push(notification);
        }
      }

      if (notifications.length > 0) {
        try {
          await LocalNotifications.schedule({ notifications });
        } catch (error) {
          let successCount = 0;
          for (const notification of notifications) {
            try {
              await LocalNotifications.schedule({ notifications: [notification] });
              successCount++;
            } catch (individualError) {
              try {
                const simpleNotification = {
                  ...notification,
                  schedule: {
                    at: notification.schedule.at,
                    allowWhileIdle: true,
                  }
                };
                await LocalNotifications.schedule({ notifications: [simpleNotification] });
                successCount++;
              } catch (simpleError) {
                console.error('Failed to schedule notification:', simpleError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) return;

      const pending = await LocalNotifications.getPending();
      const habitNotifications = pending.notifications.filter(
        notification => this.isHabitNotification(notification.id)
      );

      if (habitNotifications.length > 0) {
        const ids = habitNotifications.map(n => ({ id: n.id }));
        await LocalNotifications.cancel({ notifications: ids });
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  static async resetAllNotifications(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      const pending = await LocalNotifications.getPending();

      if (pending.notifications.length === 0) {
        return;
      }

      const allIds = pending.notifications.map(n => ({ id: n.id }));
      await LocalNotifications.cancel({ notifications: allIds });
    } catch (error) {
      console.error('Error resetting notifications:', error);
    }
  }

  static async clearHabitNotifications(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) return;

      const pending = await LocalNotifications.getPending();
      const habitNotifications = pending.notifications.filter(
        notification => this.isHabitNotification(notification.id)
      );

      if (habitNotifications.length === 0) {
        return;
      }

      const habitIds = habitNotifications.map(n => ({ id: n.id }));
      await LocalNotifications.cancel({ notifications: habitIds });
    } catch (error) {
      console.error('Error clearing habit notifications:', error);
    }
  }

  static async cancelHabitNotification(habitId: number): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) return;

      const notificationId = this.generateNotificationId(habitId);
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    } catch (error) {
      console.error('Error cancelling habit notification:', error);
    }
  }

  static async sendTestNotification(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) return false;

      await LocalNotifications.schedule({
        notifications: [{
          id: 99999,
          title: '🧪 Test Habit Reminder',
          body: 'This is a test notification! Tap to go to home.',
          schedule: { at: new Date(Date.now() + 3000) },
          sound: 'default',
          extra: { navigateTo: '/home', isTest: true }
        }]
      });

      return true;
    } catch (error) {
      console.error('Test notification failed:', error);
      return false;
    }
  }

  private static getEligibleHabits(habits: Habit[]): Habit[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habits.filter(habit => {
      if (!habit.notificationTime) {
        return false;
      }

      if (habit.pauseUntil) {
        const pauseDate = new Date(habit.pauseUntil);
        pauseDate.setHours(0, 0, 0, 0);
        if (today <= pauseDate) {
          return false;
        }
      }

      if (habit.endAt) {
        const endDate = new Date(habit.endAt);
        endDate.setHours(0, 0, 0, 0);
        if (today >= endDate) {
          return false;
        }
      }

      const startDate = new Date(habit.startAt);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) {
        return false;
      }

      if (!this.isHabitApplicableToday(habit, today)) {
        return false;
      }

      if (this.isHabitCompletedToday(habit, today)) {
        return false;
      }

      return true;
    });
  }

  private static isHabitApplicableToday(habit: Habit, today: Date): boolean {
    if (habit.frequency.type === 'daily') {
      return true;
    }

    if (habit.frequency.type === 'weekly' && habit.frequency.targetDays) {
      const dayOfWeek = today.getDay();
      return habit.frequency.targetDays.includes(dayOfWeek);
    }

    return false;
  }

  private static isHabitCompletedToday(habit: Habit, today: Date): boolean {
    if (!habit.completions || habit.completions.length === 0) {
      return false;
    }

    return habit.completions.some(completion => {
      const completionDate = new Date(completion.completedAt);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === today.getTime();
    });
  }

  private static createNotificationForHabit(habit: Habit): LocalNotificationSchema | null {
    if (!habit.notificationTime) return null;

    const notificationTime = this.parseTimeString(habit.notificationTime);

    if (!notificationTime) {
      return null;
    }

    const now = new Date();
    let scheduledDate = new Date();
    
    scheduledDate.setHours(notificationTime.hour, notificationTime.minute, 0, 0);

    if (habit.frequency.type === 'daily') {
      if (scheduledDate <= now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }
    } else if (habit.frequency.type === 'weekly' && habit.frequency.targetDays) {
      const targetDays = habit.frequency.targetDays;
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const notificationTimeMinutes = notificationTime.hour * 60 + notificationTime.minute;

      if (!(targetDays.includes(currentDay) && currentTime < notificationTimeMinutes)) {
        let daysToAdd = 1;
        let nextDay = (currentDay + 1) % 7;

        while (!targetDays.includes(nextDay)) {
          daysToAdd++;
          nextDay = (nextDay + 1) % 7;
        }

        scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);
      }
    } else {
      if (scheduledDate <= now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }
    }

    if (scheduledDate <= now) {
      scheduledDate = new Date(now.getTime() + 2 * 60 * 1000);
      scheduledDate.setSeconds(0, 0);
    }

    const timeDiff = scheduledDate.getTime() - now.getTime();
    if (timeDiff < 10000) {
      scheduledDate = new Date(now.getTime() + 60000);
    }

    const notificationId = this.generateNotificationId(habit.id);

    return {
      id: notificationId,
      title: `🔔 ${habit.name} Reminder`,
      body: `Time for your ${habit.name} habit! ${habit.icon || ''}`,
      schedule: {
        at: scheduledDate,
        every: habit.frequency.type === 'daily' ? 'day' : 'week',
        repeats: true,
        allowWhileIdle: true,
      },
      sound: 'default',
      actionTypeId: 'HABIT_REMINDER',
      extra: {
        habitId: habit.id,
        habitName: habit.name,
        navigateTo: '/home',
      },
    };
  }

  private static async setupNotificationListeners(): Promise<void> {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      window.dispatchEvent(new CustomEvent('habitNotificationTapped', {
        detail: {
          habitId: notification.notification.extra?.habitId,
          navigateTo: '/home'
        }
      }));
    });
  }

  private static generateNotificationId(habitId: number): number {
    return habitId * this.HABIT_ID_MULTIPLIER;
  }

  private static isHabitNotification(notificationId: number): boolean {
    const isNewFormat = notificationId % this.HABIT_ID_MULTIPLIER === 0 && notificationId < 100000;
    const isOldFormat = notificationId > 1000000000000 && notificationId.toString().endsWith('000');
    return isNewFormat || isOldFormat;
  }

  private static parseTimeString(timeString: string): { hour: number; minute: number } | null {
    try {
      let hour: number, minute: number;

      if (timeString.includes(':')) {
        const timePart = timeString.split(' ')[0];
        const [hourStr, minuteStr] = timePart.split(':');
        hour = parseInt(hourStr);
        minute = parseInt(minuteStr);

        if (timeString.toLowerCase().includes('pm') && hour !== 12) {
          hour += 12;
        } else if (timeString.toLowerCase().includes('am') && hour === 12) {
          hour = 0;
        }
      } else {
        return null;
      }

      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return null;
      }

      return { hour, minute };
    } catch (error) {
      return null;
    }
  }
}