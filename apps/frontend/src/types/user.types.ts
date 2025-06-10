export interface User {
    id: number;
    email: string;
    name?: string;
    photoUrl?: string;
    isPremium: boolean;
    timezone?: string;
    joinedAt: string;
    lastLoginAt?: string;
  }
  
  export interface UserSettings {
    emailNotifications: boolean;
    publicProfile: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  }
  
  export interface UpdateProfileRequest {
    name?: string;
    timezone?: string;
  }
  
  export interface UpdateUserSettingsRequest {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    publicProfile?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  }
  
  export interface UserPlan {
    plan: 'free' | 'premium';
    habitLimit: number;
    currentHabitCount: number;
    canCreateHabit: boolean;
    premiumFeatures: string[];
  }
  