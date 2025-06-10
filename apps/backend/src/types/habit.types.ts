import { Category, CompletionStatus, Habit, SubCategory } from "@prisma/client";

export type FrequencyType = 'daily' | 'weekly';

export interface CreateHabitInput {
  name: string;
  description?: string;
  category: Category;
  subcategory: SubCategory;
  frequency: {
    type: FrequencyType;
    targetDays?: number[]; 
  };
  startAt?: Date;
  endAt?: Date;
  notificationTime?: string;
  pauseUntil?: Date;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  category?: Category;
  subcategory?: SubCategory;
  frequency?: {
    type: FrequencyType;
    targetDays?: number[]; 
  };
  endAt?: Date;
  notificationTime?: string;
  pauseUntil?: Date;
}

export interface ToggleHabitInput {
  habitId: number;
  date: string;
  mood?: number;
  notes?: string;
}

export interface HabitWithStats {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  category: Category;
  subcategory: SubCategory;
  icon: string;
  color: string;
  startAt: Date;
  endAt?: Date;
  notificationTime?: string;
  frequency: {
    type: FrequencyType;
    targetDays?: number[]; 
  };
  pauseUntil?: Date;
  createdAt: Date;
  deletedAt?: Date;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  completions: Completion[];
}

export interface Completion {
  id: number;
  habitId: number;
  userId: number;
  mood?: string;
  note?: string;
  status: CompletionStatus;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyHabitSummary {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  status: 'complete' | 'partial' | 'none';
  habits: HabitDayDetail[];
}

export interface HabitDayDetail {
  id: number;
  name: string;
  completed: boolean;
  completedAt?: Date;
}

