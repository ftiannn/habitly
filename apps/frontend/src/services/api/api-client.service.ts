import { API_URL } from '@/config/environment';
import authService from './auth.service';
import { toast } from 'sonner';

export class ApiError extends Error {
  status: number;
  data: unknown;
  context: unknown;

  constructor(message: string, status: number, data?: unknown, context?: string) {
    super(message);
    this.name = 'ApiError';
    this.context = context;
    this.status = status;
    this.data = data;
  }
}

class ApiClientClass {
  private refreshPromise: Promise<string> | null = null;
  private isRefreshing = false;

  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = authService.getRefreshToken?.();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        if (authService.isRefreshTokenExpired?.()) {
          throw new Error('Refresh token expired');
        }

        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Token refresh failed: ${response.status}`);
        }

        const responseData = await response.json();

        if (!responseData.success || !responseData.data) {
          throw new Error('Invalid refresh response structure');
        }

        const { accessToken, refreshToken: newRefreshToken, user } = responseData.data;

        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        // Update tokens
        authService.setToken(accessToken);
        if (newRefreshToken && authService.setRefreshToken) {
          authService.setRefreshToken(newRefreshToken);
        }

        // Update user data if provided
        if (user && authService.saveAuthData) {
          authService.saveAuthData({
            token: accessToken,
            refreshToken: newRefreshToken || refreshToken,
            user: user
          });
        }

        return accessToken;
      } catch (error) {
        // Only clear auth data if it's a definitive auth failure
        if (error instanceof Error &&
          (error.message.includes('expired') ||
            error.message.includes('invalid') ||
            error.message.includes('401') ||
            error.message.includes('403'))) {
          authService.clearAuthData();
        }
        throw error;
      } finally {
        this.refreshPromise = null;
        this.isRefreshing = false;
      }
    })();

    return this.refreshPromise;
  }

  private async ensureValidToken(): Promise<string | null> {
    const token = authService.getToken();

    // If no token, return null
    if (!token) {
      return null;
    }

    // If token is not expired, return it
    if (!authService.isTokenExpired()) {
      return token;
    }

    // Token is expired, try to refresh
    try {
      const newToken = await this.handleTokenRefresh();
      if (newToken) {
        return newToken;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...options.headers
    };

    const isAuthEndpoint = endpoint.startsWith('auth/') &&
      (endpoint.includes('refresh') || endpoint.includes('login') || endpoint.includes('google'));


    // For non-auth endpoints, ensure we have a valid token
    if (!isAuthEndpoint) {
      const validToken = await this.ensureValidToken();
      if (validToken) {
        headers['Authorization'] = `Bearer ${validToken}`;

      } else {
        authService.clearAuthData();
        throw new ApiError('Authentication required', 401);
      }
    }


    try {
      const response = await fetch(url, { ...options, headers });


      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        throw new ApiError('Invalid response format', response.status);
      }

      // If we still get auth errors after ensuring valid token, it means refresh failed
      if (!response.ok && !isAuthEndpoint && (response.status === 401 || response.status === 403)) {
        authService.clearAuthData();
        toast.error('Session expired. Please sign in again.');
        throw new ApiError('Authentication failed', 401);
      }

      // Handle other 400 errors that might be token-related
      if (!response.ok && !isAuthEndpoint && response.status === 400) {
        const errorText = JSON.stringify(responseData).toLowerCase();

        const isTokenError = errorText.includes('token') ||
          errorText.includes('unauthorized') ||
          errorText.includes('invalid') ||
          errorText.includes('expired') ||
          errorText.includes('jwt') ||
          errorText.includes('malformed');

        if (isTokenError) {
          authService.clearAuthData();
          toast.error('Session expired. Please sign in again.');
          throw new ApiError('Authentication failed', 401);
        }
      }

      // Handle other errors
      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `HTTP ${response.status}`;


        throw new ApiError(errorMessage, response.status, responseData);
      }

      return responseData;
    } catch (error) {
      console.error('Error in fetch or response handling:', {
        errorType: error.constructor.name,
        errorMessage: error.message,
        isTypeError: error instanceof TypeError,
        isApiError: error instanceof ApiError
      });

      if (error instanceof ApiError) throw error;

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0);
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }
}

const apiClientInstance = new ApiClientClass();

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiClientInstance.request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    apiClientInstance.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    }),

  put: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    apiClientInstance.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    }),

  patch: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
    apiClientInstance.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...options?.headers }
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiClientInstance.request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export const localStorageFallback = {
  save: <T>(key: string, data: T): void => {
    try {
      if (data === undefined || data === null) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('localStorage save failed:', error);
    }
  },

  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'null' || item === 'undefined') {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error('localStorage load failed:', error);
      localStorage.removeItem(key);
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage remove failed:', error);
    }
  }
};