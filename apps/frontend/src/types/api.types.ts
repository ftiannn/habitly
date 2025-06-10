import { BadgeDefinition } from "./badge.types";
import { Habit } from "./habit.types";
import { User, UserSettings, UserPlan } from "./user.types";

export interface ApiResponse<T = never> {
  data?: T;
  message?: string;
  success?: boolean;
  timestamp?: string;
}

// Error response format
export interface ApiError {
  error?: string;
  message: string;
  status?: number;
  statusCode?: number;
  timestamp?: string;
  details?: Record<string, unknown>;
}

// Specific response types
export interface HabitsResponse {
  habits: Habit[];
  message: string;
}

export interface HabitResponse {
  habit: Habit;
  message: string;
}

export interface UserProfileResponse {
  user: User;
  message: string;
}

export interface UserSettingsResponse {
  settings: UserSettings;
  message: string;
}

export interface UserPlanResponse extends UserPlan {
  message: string;
}

export interface BadgeDefinitionsResponse {
  badges: BadgeDefinition[];
  message: string;
}

