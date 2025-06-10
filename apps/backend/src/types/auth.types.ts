export interface GoogleOAuthRequest {
    idToken: string;
    timezone: string;
}

export interface UserProfile {
    id: number;
    email: string;
    name: string | null;
    photoUrl: string | null;
    isPremium: boolean;
    joinedAt: string;
    provider: string;
    timezone: string;
    lastLoginAt: string;
}

export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken?: string;
}

export interface CreateUserData {
    email: string;
    password?: string;
    name?: string;
    photoUrl?: string;
    googleId?: string;
    timezone?: string;
    provider: 'google';
}

export interface UpdateUserData {
    password?: string;
    name?: string;
    photoUrl?: string;
    googleId?: string;
    isPremium?: boolean;
}
