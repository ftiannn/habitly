import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/api/auth.service';
import { handleError } from '@/lib/utils/error-utils';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/services/api/api-client.service';
import { toast } from 'sonner';
import { preloader } from '@/lib/query-client';
import { User } from '@/types';
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  googleLogin: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  googleLogin: async () => false,
  logout: async () => { },
  updateUser: () => { },
  clearError: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        authService.migrateTokens();
        const hasValidAuth = authService.stayLoggedIn();

        if (hasValidAuth) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } else {
          authService.clearAuthData();
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        authService.clearAuthData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      preloader.preloadEssentials();
    }
  }, [user, isLoading]);

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Authenticate with Google OAuth
   * @param idToken Google ID token
   * @returns True if login was successful
   */
  const googleLogin = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await authService.googleAuth(idToken, timezone);
      setUser(response.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Google login error:', err);

      let errorMessage = 'Google sign-in failed. Please try again.';

      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = 'Google authentication failed. Please try signing in again.';
        } else if (err.status === 400) {
          errorMessage = 'Invalid Google authentication. Please try again.';
        } else if (err.status === 429) {
          errorMessage = 'Too many authentication attempts. Please try again later.';
        }
      }

      const error = new Error(errorMessage);
      setError(error);

      toast.error('Google Sign-in Failed', {
        description: errorMessage,
        duration: 4000,
      });

      setIsLoading(false);
      return false;
    }
  };

  /**
   * Log out the current user
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
      navigate('/login');
    }
  };

  /**
   * Update the user data in context
   * @param userData Partial user data to update
   */
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      authService.saveAuthData({
        token: authService.getToken() || '',
        refreshToken: authService.getRefreshToken() || '',
        user: updatedUser
      });
    }
  };

  const isAuthenticated = !!user && authService.stayLoggedIn();

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    googleLogin,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;