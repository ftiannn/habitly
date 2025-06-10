import { ApiError } from '@/services/api/api-client.service';
import { toast } from 'sonner';

/**
 * Standard error types for consistent handling
 */
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

/**
 * Context-aware error message mapping
 * Different contexts (login, registration, profile, etc.) get different messages for the same HTTP status
 */
const getContextualErrorMessage = (error: ApiError, context?: string): string => {
  const status = error.status;
  const message = error.message;

  // Handle authentication contexts specially
  if (context === 'login') {
    switch (status) {
      case 401:
        return 'Invalid email or password';
      case 400:
        return message || 'Please provide valid email and password';
      case 429:
        return 'Too many login attempts. Please try again later.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Login service is temporarily unavailable. Please try again later.';
      default:
        return message || 'Login failed. Please try again.';
    }
  }

  if (context === 'registration' || context === 'signup') {
    switch (status) {
      case 409:
        return 'An account with this email already exists';
      case 400:
        return message || 'Please check your registration information';
      case 429:
        return 'Too many registration attempts. Please try again later.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Registration service is temporarily unavailable. Please try again later.';
      default:
        return message || 'Registration failed. Please try again.';
    }
  }

  if (context === 'google-auth' || context === 'google login') {
    switch (status) {
      case 401:
        return 'Google authentication failed. Please try signing in again.';
      case 400:
        return 'Invalid Google authentication. Please try again.';
      case 429:
        return 'Too many authentication attempts. Please try again later.';
      default:
        return message || 'Google sign-in failed. Please try again.';
    }
  }

  if (context === 'profile' || context === 'user-profile') {
    switch (status) {
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You don\'t have permission to access this profile.';
      case 404:
        return 'Profile not found.';
      default:
        return message || 'Failed to load profile. Please try again.';
    }
  }

  if (context === 'password-change') {
    switch (status) {
      case 400:
        return message || 'Current password is incorrect';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 422:
        return message || 'New password doesn\'t meet requirements';
      default:
        return message || 'Failed to change password. Please try again.';
    }
  }

  // Default fallback for other contexts
  return getGenericErrorMessage(error);
};

/**
 * Generic error message for non-authentication contexts
 */
const getGenericErrorMessage = (error: ApiError): string => {
  switch (error.status) {
    case 400:
      return error.message || 'Invalid request. Please check your data and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested item was not found.';
    case 409:
      return error.message || 'This item already exists.';
    case 422:
      return error.message || 'The data you provided is invalid.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'We\'re experiencing server issues. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Get a user-friendly error message based on the error and context
 * @param error The error object
 * @param context Optional context about where the error occurred
 * @returns A user-friendly error message
 */
export const getFriendlyErrorMessage = (error: unknown, context?: string): string => {
  if (error instanceof ApiError) {
    return getContextualErrorMessage(error, context);
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'The request timed out. Please check your connection and try again.';
    }
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message || 'An unexpected error occurred.';
  }

  return 'An unexpected error occurred.';
};

/**
 * Get the error type based on the error object
 * @param error The error object
 * @returns The error type
 */
export const getErrorType = (error: unknown): ErrorType => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return ErrorType.VALIDATION;
      case 401:
        return ErrorType.AUTHENTICATION;
      case 403:
        return ErrorType.AUTHORIZATION;
      case 404:
        return ErrorType.NOT_FOUND;
      case 408:
        return ErrorType.TIMEOUT;
      case 429:
        return ErrorType.RATE_LIMIT;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return ErrorType.TIMEOUT;
    }
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return ErrorType.NETWORK;
    }
  }

  return ErrorType.UNKNOWN;
};

/**
 * Handle an error with appropriate toast notifications and logging
 * @param error The error object
 * @param context Optional context about where the error occurred
 */
export const handleError = (error: unknown, context?: string): void => {
  const errorMessage = getFriendlyErrorMessage(error, context);
  const errorType = getErrorType(error);

  // Log the error with context
  console.error(`Error ${context ? `in ${context}` : ''}: ${errorMessage}`, error);

  // Show toast notification based on error type and context
  switch (errorType) {
    case ErrorType.NETWORK:
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
        duration: 4000,
      });
      break;

    case ErrorType.AUTHENTICATION:
      // Don't show generic "session expired" toast for login contexts
      if (context === 'login' || context === 'registration' || context === 'google-auth') {
        toast.error('Authentication failed', {
          description: errorMessage,
          duration: 4000,
        });
      } else {
        toast.error('Session expired', {
          description: 'Please sign in again to continue.',
          duration: 4000,
        });
      }
      break;

    case ErrorType.AUTHORIZATION:
      toast.error('Access denied', {
        description: errorMessage,
        duration: 4000,
      });
      break;

    case ErrorType.VALIDATION:
      toast.error('Invalid data', {
        description: errorMessage,
        duration: 4000,
      });
      break;

    case ErrorType.RATE_LIMIT:
      toast.error('Too many requests', {
        description: errorMessage,
        duration: 6000,
      });
      break;

    case ErrorType.SERVER:
      toast.error('Server error', {
        description: errorMessage,
        duration: 4000,
      });
      break;

    default:
      toast.error('Error', {
        description: errorMessage,
        duration: 4000,
      });
  }
};

/**
 * Create a context-aware ApiError
 * @param message Error message
 * @param status HTTP status code
 * @param context Context where the error occurred
 * @param data Additional error data
 * @returns ApiError with context
 */
export const createContextualError = (
  message: string,
  status: number,
  context: string,
  data?: unknown
): ApiError => {
  return new ApiError(message, status, data, context);
};