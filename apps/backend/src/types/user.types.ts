export interface UserProfile {
    id: number;
    email: string;
    name?: string;
    photoUrl?: string;
    isPremium: boolean;
    timezone?: string;
    joinedAt: Date;
    lastLoginAt?: Date;
}

export interface UserSettingResponse {
    emailNotifications: boolean;
    publicProfile: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
}

export interface UpdateSettingsInput {
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

export interface UpdateProfileInput {
    name?: string;
    timezone?: string;
}

