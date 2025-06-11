import { API_CONFIG, API_URL } from '@/config/environment';
import { apiClient, ApiError, localStorageFallback } from './api-client.service';
import { AuthResponse, BackendAuthResponse, BackendResponse, User } from '@/types';
import { queryClient } from '@/lib/query-client';
import TokenSecurity from '@/lib/utils/token-security';
import { habitNotificationService } from '../notifications/notification.service';

const ENDPOINTS = {
  REGISTER: 'auth/register',
  LOGIN: 'auth/login',
  GOOGLE_AUTH: 'auth/google',
  ME: 'auth/me',
  CHANGE_PASSWORD: 'auth/change-password',
  LOGOUT: 'auth/logout',
  REFRESH: 'auth/refresh'
};

const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'auth_token_refresh';
const USER_STORAGE_KEY = 'auth_user';

interface TokenInfo {
  exp: number;
  expiresAt: string;
  isExpired: boolean;
  timeUntilExpiry: number;
}

export const authService = {
  /**
   * Authenticate with Google OAuth
   * @param idToken Google ID token
   * @param timezone Client's side timezone
   * @returns Promise with auth token and user data
   */
  async googleAuth(idToken: string, timezone: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<BackendResponse<BackendAuthResponse>>(ENDPOINTS.GOOGLE_AUTH, { idToken, timezone });

      if (!response.success || !response.data) {
        throw new Error('Google authentication failed');
      }

      const authResponse: AuthResponse = {
        refreshToken: response.data.refreshToken,
        token: response.data.accessToken,
        user: response.data.user
      };

      this.saveAuthData(authResponse);

      return authResponse;
    } catch (error) {
      console.error('❌ Detailed error analysis:', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        errorStatus: error.status,
        errorData: error.data,
        hasApiErrorProperties: {
          hasStatus: 'status' in error,
          hasData: 'data' in error,
          hasContext: 'context' in error
        },
        fullError: error
      });
  
      // If it's an ApiError with data, log the response details
      if (error instanceof ApiError && error.data) {
        console.error('❌ Backend error response:', error.data);
      }
  
      // Add context to API errors
      if (error instanceof ApiError) {
        error.context = 'google-auth';
      }
  
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      // First check if we have the user in localStorage
      const cachedUser = this.getUser();
      if (cachedUser && !this.isTokenExpired()) {
        return cachedUser;
      }

      // If not in cache or token expired, fetch from API
      const response = await apiClient.get<BackendResponse<User>>(ENDPOINTS.ME);

      if (!response.success || !response.data) {
        throw new Error('Failed to get user profile');
      }

      // Update user in localStorage
      localStorageFallback.save(USER_STORAGE_KEY, response.data);

      return response.data;
    } catch (error) {
      // If unauthorized, clear auth data
      if (error instanceof ApiError && error.status === 401) {
        this.clearAuthData();
        // Add context to API errors
        error.context = 'profile';
      }

      console.error('Failed to get current user:', error);
      throw error;
    }
  },

  /**
   * Log out the current user
   * @returns Promise with success status
   */
  async logout(): Promise<boolean> {
    try {
      // Only call API if we're not in mock mode
      if (!API_CONFIG.USE_MOCK) {
        await apiClient.post<BackendResponse<null>>(ENDPOINTS.LOGOUT, {});
      }

      // Clear auth data regardless of API call success
      this.clearAuthData();
      queryClient.clear();
      await habitNotificationService.cancelAllNotifications();

      return true;
    } catch (error) {
      console.error('Logout error:', error);

      // Clear auth data even if API call fails
      this.clearAuthData();
      queryClient.clear();
      await habitNotificationService.cancelAllNotifications();

      return false;
    }
  },

  /**
   * Get the current authentication token
   * @returns The authentication token or null if not authenticated
   */
  getToken(): string | null {
    const hashedToken = localStorageFallback.load<string | null>(TOKEN_STORAGE_KEY, null);

    if (!hashedToken) return null;

    return TokenSecurity.unhashToken(hashedToken);
  },

  /**
   * Save authentication token to localStorage
   * @param token Authentication token to store securely
   */
  setToken(token: string): void {
    // Hash the token before storing for security
    const hashedToken = TokenSecurity.hashToken(token);
    localStorageFallback.save(TOKEN_STORAGE_KEY, hashedToken);
  },

  /**
   * Get the current authentication refresh token
   * @returns The authentication refresh token or null if not authenticated
   */
  getRefreshToken(): string | null {
    const hashedRefreshToken = localStorageFallback.load<string | null>(REFRESH_TOKEN_STORAGE_KEY, null);

    if (!hashedRefreshToken) return null;

    return TokenSecurity.unhashToken(hashedRefreshToken);
  },

  /**
   * Save authentication refresh token to localStorage
   * @param token Refresh token to store securely
   */
  setRefreshToken(token: string): void {
    // Hash the refresh token before storing for security
    const hashedRefreshToken = TokenSecurity.hashToken(token);
    localStorageFallback.save(REFRESH_TOKEN_STORAGE_KEY, hashedRefreshToken);
  },

  /**
   * Get the current authenticated user
   * @returns The user object or null if not authenticated
   */
  getUser(): User | null {
    return localStorageFallback.load<User | null>(USER_STORAGE_KEY, null);
  },

  /**
   * Check if user is authenticated
   * @returns True if user is authenticated and token is valid
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  },

  /**
   * Save authentication data to localStorage
   * @param data Authentication response data
   */
  saveAuthData(data: AuthResponse): void {
    this.setToken(data.token);
    this.setRefreshToken(data.refreshToken);
    localStorageFallback.save(USER_STORAGE_KEY, data.user);
  },

  /**
   * Clear authentication data from localStorage
   */
  clearAuthData(): void {
    localStorageFallback.remove(TOKEN_STORAGE_KEY);
    localStorageFallback.remove(REFRESH_TOKEN_STORAGE_KEY);
    localStorageFallback.remove(USER_STORAGE_KEY);
    localStorageFallback.remove('capgo_social_login_google_state')
  },

  /**
   * Migrate existing plain tokens to hashed format
   */
  migrateTokens(): void {
    try {
      const storedToken = localStorageFallback.load<string | null>(TOKEN_STORAGE_KEY, null);
      const storedRefreshToken = localStorageFallback.load<string | null>(REFRESH_TOKEN_STORAGE_KEY, null);
      
      if (storedToken) {
        const unhashedToken = TokenSecurity.unhashToken(storedToken);
        if (unhashedToken.split('.').length !== 3) {
          localStorageFallback.remove(TOKEN_STORAGE_KEY);
        }
      }
      
      if (storedRefreshToken) {
        const unhashedRefreshToken = TokenSecurity.unhashToken(storedRefreshToken);
        if (unhashedRefreshToken.split('.').length !== 3) {
          localStorageFallback.remove(REFRESH_TOKEN_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Token validation failed, clearing all tokens:', error);
      this.clearAuthData();
    }
  },
  
  /**
   * Validate stored tokens for security and integrity
   * @returns True if stored tokens appear valid
   */
  validateStoredTokens(): boolean {
    try {
      const hashedToken = localStorageFallback.load<string | null>(TOKEN_STORAGE_KEY, null);
      const hashedRefreshToken = localStorageFallback.load<string | null>(REFRESH_TOKEN_STORAGE_KEY, null);

      if (!hashedToken || !hashedRefreshToken) return false;

      this.migrateTokens();

      if (TokenSecurity.isHashedToken(hashedToken)) {
        if (!TokenSecurity.validateHashedToken(hashedToken)) {
          console.warn('Invalid hashed access token detected');
          return false;
        }
      }

      if (TokenSecurity.isHashedToken(hashedRefreshToken)) {
        if (!TokenSecurity.validateHashedToken(hashedRefreshToken)) {
          console.warn('Invalid hashed refresh token detected');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  /**
   * Check if the current token is expired
   * @returns True if token is expired or invalid
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }
  
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format: expected 3 parts, got', parts.length);
        return true;
      }
  
      const payloadBase64 = parts[1];
      if (!payloadBase64) {
        console.error('Invalid JWT: missing payload');
        return true;
      }
  
      // Convert base64url to standard base64
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  
      const payload = JSON.parse(atob(padded));
  
      // If no expiration claim, consider it valid (shouldn't happen for access tokens)
      if (!payload.exp) {
        return false;
      }
  
      // Check if expired (with small buffer)
      const bufferTime = 30 * 1000; // 30 seconds buffer
      return (payload.exp * 1000) < (Date.now() + bufferTime);
    
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },
  

  /**
   * Check if the current refresh token is expired
   * @returns True if refresh token is expired or invalid
   */
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return true;
    }
  
    try {
      // Check if this is a hex token (refresh tokens from your backend)
      if (/^[0-9a-f]+$/i.test(refreshToken)) {
        return false; 
      }
  
      // If it's a JWT format, decode and check expiration
      const parts = refreshToken.split('.');
      if (parts.length !== 3) {
        console.error('Invalid refresh token JWT format: expected 3 parts, got', parts.length);
        return true;
      }
  
      const payloadBase64 = parts[1];
      if (!payloadBase64) {
        console.error('Invalid refresh token JWT: missing payload');
        return true;
      }
  
      // Convert base64url to standard base64
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  
      const payload = JSON.parse(atob(padded));
  
      // If no expiration claim, consider it valid
      if (!payload.exp) {
        return false;
      }
  
      // Add 5 minute buffer before expiration
      const bufferTime = 5 * 60 * 1000;
      return (payload.exp * 1000) < (Date.now() + bufferTime);
    } catch (error) {
      console.error('Error checking refresh token expiration:', error);
      return true;
    }
  },
  
  

  /**
   * Check if user has valid authentication (access token valid or refresh token can be used)
   * @returns True if user has valid authentication
   */
  hasValidAuth(): boolean {
    const hasValidAccessToken = this.getToken() && !this.isTokenExpired();
    const hasValidRefreshToken = this.getRefreshToken() && !this.isRefreshTokenExpired();
  
    return hasValidAccessToken || hasValidRefreshToken;
  },

  stayLoggedIn(): boolean {
    return this.hasValidAuth();
  }

};

export default authService;