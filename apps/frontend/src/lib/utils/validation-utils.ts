import { z } from 'zod';

// Validation utilities for forms

export interface ValidationError {
  field: string;
  message: string;
}

// Email validation schema
export const emailSchema = z.string().email('Please enter a valid email address');

/**
 * Password validation schema with custom error messages
 * Rules:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (value) => /[A-Z]/.test(value),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (value) => /[a-z]/.test(value),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (value) => /[0-9]/.test(value),
    'Password must contain at least one number'
  )
  .refine(
    (value) => /[^A-Za-z0-9]/.test(value),
    'Password must contain at least one special character'
  );

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// Common validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

export const profileSchema = z.object({
  name: z.string()
    .trim()
    .transform(val => val === '' ? undefined : val)
    .optional(),
  timezone: z.string()
    .transform(val => val === '' ? undefined : val)
    .optional(),
});

export const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  quietHoursEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
}).superRefine((data, ctx) => {
  if (data.quietHoursEnabled) {
    // Check if start time is provided when quiet hours is enabled
    if (data.quietHoursStart !== undefined && !data.quietHoursStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time is required when quiet hours is enabled',
        path: ['quietHoursStart'],
      });
    }

    // Check if end time is provided when quiet hours is enabled
    if (data.quietHoursEnd !== undefined && !data.quietHoursEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time is required when quiet hours is enabled',
        path: ['quietHoursEnd'],
      });
    }

    if (data.quietHoursStart && data.quietHoursEnd) {
      if (data.quietHoursStart === data.quietHoursEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start and end times cannot be the same',
          path: ['quietHoursEnd'],
        });
      }
    }
  }
});


export const isValidEmail = (email: string): boolean => {
  const result = emailSchema.safeParse(email);
  return result.success;
};

export const isValidPassword = (password: string): boolean => {
  const result = passwordSchema.safeParse(password);
  return result.success;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password || password.length < 8) return 'weak';

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  if (score <= 2) return 'weak';
  if (score === 3) return 'medium';
  return 'strong';
};

// Error handling utilities for form validation
export const getValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      errors[path] = err.message;
    }
  });

  return errors;
};

/**
 * Helper function to check if a date is before today (at midnight)
 * @param date The date to check
 * @returns true if the date is before today
 */
export const isBeforeToday = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Helper function to create consistent calendar date disabling logic
 * @param date The date to check
 * @param startDate Optional start date reference (will disable dates before this)
 * @param pauseUntilDate Optional pause until date (will disable dates before this)
 * @param isPaused Whether the habit is paused
 * @returns true if the date should be disabled
 */
export const shouldDisableDate = (
  date: Date,
  startDate: Date,
  pauseUntilDate?: Date,
  isPaused?: boolean
): boolean => {
  // First check if date is before today
  if (isBeforeToday(date)) return true;

  // Then check if date is before start date
  if (date < startDate) return true;

  // Finally check if date is before pause end date (if pause is enabled)
  if (isPaused && pauseUntilDate && date <= pauseUntilDate) return true;

  return false;
};

/**
 * Validates habit form data
 * @returns Array of validation errors (empty if valid)
 */
export const validateHabitForm = (formData: {
  name: string;
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays: number[];
  isPaused: boolean;
  pauseDuration: 7 | 14 | 30 | 'custom';
  pauseUntilDate?: Date;
  endDate?: Date;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate name (required, min length 2, max length 50)
  if (!formData.name) {
    errors.push({ field: 'name', message: 'Habit name is required' });
  } else if (formData.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Habit name must be at least 2 characters' });
  } else if (formData.name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Habit name must be less than 50 characters' });
  }

  // Validate weekly frequency days selection
  if (formData.frequency === 'weekly' && (!formData.selectedDays || formData.selectedDays.length === 0)) {
    errors.push({ field: 'selectedDays', message: 'Please select at least one day of the week' });
  }

  // Validate pause settings
  if (formData.isPaused) {
    if (formData.pauseDuration === 'custom' && !formData.pauseUntilDate) {
      errors.push({ field: 'pauseUntilDate', message: 'Please select a date to pause until' });
    }

    // Validate that end date is after pause period (if both are set)
    if (formData.pauseUntilDate && formData.endDate) {
      const pauseDate = new Date(formData.pauseUntilDate);
      const endDate = new Date(formData.endDate);

      if (pauseDate > endDate) {
        errors.push({ field: 'endDate', message: 'End date must be after the pause period ends' });
      }
    }
  }

  return errors;
};

/**
 * Shows error toast messages for validation errors
 * @returns true if there were errors, false if valid
 */
export const showValidationErrors = (
  errors: ValidationError[],
  toastFn: (message: string) => void
): boolean => {
  if (errors.length > 0) {
    // Show the first error
    toastFn(errors[0].message);
    return true;
  }
  return false;
};