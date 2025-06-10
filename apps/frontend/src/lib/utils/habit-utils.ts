import { Habit, HabitCategory, HabitColor } from '@/types/habit.types';
import {
  isBefore,
  getDay,
  isValid,
  isSameDay
} from 'date-fns';

/**
 * Format a date to a string in the format YYYY-MM-DD using local date components
 * @param date Date object to format, defaults to current date if not provided
 * @returns Date string in YYYY-MM-DD format using local date components
 */
export const formatLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date as a string in the format YYYY-MM-DD using local date components
 * @returns Today's date string in YYYY-MM-DD format
 */
export const getTodayDateString = (): string => {
  return formatLocalDateString(new Date());
};

/**
 * Check if a habit is completed on a specific date
 */
export const isHabitCompletedOnDate = (habit: Habit, date: Date): boolean => {
  const record = habit.completions?.find(record => isSameDay(record.completedAt, date));
  return record ? !!record.completedAt : false;
};

/**
 * Get color based on category
 */
export const getCategoryColor = (category: HabitCategory): HabitColor => {
  const colorMap: Record<HabitCategory, HabitColor> = {
    personal: 'blue',
    health: 'green',
    fitness: 'red',
    mindfulness: 'purple',
    productivity: 'orange',
    learning: 'yellow',
    finance: 'emerald',
    social: 'pink',
    environmental: 'teal',
    hobbies: 'indigo',
    other: 'gray',
  };

  return colorMap[category] || 'blue';
};

/**
 * Check if a habit should be active on a specific date based on its frequency, start date, end date, and pause status
 */
export const isHabitActiveOnDate = (habit: Habit, date: Date): boolean => {
  if (!habit || !date || !isValid(date)) return false;

  const startAt = new Date(habit.startAt);

  // Check if date is before startAt (but allow same day)
  // Using isSameDay to ensure habits that start today will show up today
  if (isBefore(date, startAt) && !isSameDay(date, startAt)) {
    return false;
  }

  // Check if habit is paused for this date
  if (habit.pauseUntil) {
    const pauseUntil = new Date(habit.pauseUntil);

    // If date is before or on pauseUntil, habit is paused (not active)
    if (isBefore(date, pauseUntil) || isSameDay(date, pauseUntil)) {
      return false;
    }
  }

  // Check if habit has ended
  if (habit.endAt) {
    const endAt = new Date(habit.endAt);
    if (isBefore(endAt, date) && !isSameDay(endAt, date)) {
      return false;
    }
  }

  // Daily habits are active every day between startAt and endAt (if specified)
  if (habit.frequency.type === 'daily') {
    return true;
  }

  // Weekly habits are active only on specified days of the week
  if (habit.frequency.type === 'weekly' && habit.frequency.targetDays) {
    const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, etc.
    return habit.frequency.targetDays.includes(dayOfWeek);
  }

  // Default to showing the habit
  return true;
};

/**
 * Get habits that are active on a specific date
 */
export const getHabitsActiveOnDate = (habits: Habit[], date: Date): Habit[] => {
  if (!habits || !date) return [];

  const activeHabits = habits.filter(habit => isHabitActiveOnDate(habit, date));

  return activeHabits
};

/**
 * Check if a habit is currently paused
 */
export const isHabitPaused = (habit: Habit): boolean => {
  if (!habit.pauseUntil) return false;

  const now = new Date();
  const pauseUntil = new Date(habit.pauseUntil);

  return now <= pauseUntil;
};

/**
 * Calculate remaining days in pause period
 * @param habit The habit to check
 * @returns Number of days remaining in pause period, or 0 if not paused or pause period has ended
 */
export const getRemainingPauseDays = (habit: Habit): number => {
  if (!habit.pauseUntil) return 0;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to start of day

  const pauseUntil = new Date(habit.pauseUntil);
  pauseUntil.setHours(0, 0, 0, 0); // Normalize to start of day

  // If pause has already ended
  if (now > pauseUntil) return 0;

  // Calculate days difference
  const diffTime = pauseUntil.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Check if a habit has ended (current date is after endAt)
 */
export const isHabitEnded = (habit: Habit): boolean => {
  if (!habit.endAt) return false;

  const now = new Date();
  const endAt = new Date(habit.endAt);

  // Return true if current date is after end date (and not the same day)
  return now > endAt && !isSameDay(now, endAt);
};

/**
 * Check if a habit is deleted
 */
export const isHabitDeleted = (habit: Habit): boolean => {
  return !!habit.deletedAt;
};

/**
 * Calculate the completion status for a specific date across all habits
 */
export const getDateCompletionStatus = (
  habits: Habit[],
  date: Date,
  getHabitCompletionForDate: (habitId: number, dateStr: string) => boolean
): 'all' | 'partial' | 'none' | null => {
  const activeHabits = getHabitsActiveOnDate(habits, date);

  if (activeHabits.length === 0) return null;

  // Use the shared formatLocalDateString helper
  const dateStr = formatLocalDateString(date);
  const completedHabits = activeHabits.filter(habit =>
    getHabitCompletionForDate(habit.id, dateStr)
  );

  if (completedHabits.length === 0) return 'none';
  if (completedHabits.length === activeHabits.length) return 'all';
  return 'partial';
};