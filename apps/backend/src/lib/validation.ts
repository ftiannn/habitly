import { CreateHabitInput, UpdateHabitInput } from './../types/habit.types';
import { FrequencyType } from '@/types/habit.types';
import { UpdateProfileInput, UpdateSettingsInput } from '@/types/user.types';
import { Category, SubCategory } from '@prisma/client';

const VALID_CATEGORIES = Object.values(Category);
const VALID_SUBCATEGORIES = Object.values(SubCategory);

const isValidFrequency = (value: any): value is FrequencyType => {
  return value === 'daily' || value === 'weekly';
};

const isValidDate = (date: any): boolean => {
  return date && !isNaN(new Date(date).getTime());
};

function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function isValidDateString(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime()) &&
    dateObj.toISOString().split('T')[0] === date;
}

const validateName = (name: string | undefined, isRequired: boolean = true): string | null => {
  if (isRequired && !name?.trim()) {
    return 'Habit name is required';
  }

  if (name !== undefined) {
    if (!name?.trim()) {
      return 'Habit name cannot be empty';
    }
    if (name.length > 255) {
      return 'Habit name must be less than 255 characters';
    }
  }

  return null;
};

const validateDescription = (description: string | undefined): string | null => {
  if (description && description.length > 1000) {
    return 'Description must be less than 1000 characters';
  }
  return null;
};

const validateCategory = (category: Category | undefined, isRequired: boolean = true): string | null => {
  if (isRequired && !category) {
    return 'Category is required';
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return isRequired ? 'Valid category is required' : 'Invalid category';
  }

  return null;
};

const validateSubcategory = (subcategory: SubCategory | undefined, isRequired: boolean = true): string | null => {
  if (isRequired && !subcategory) {
    return 'Subcategory is required';
  }

  if (subcategory && !VALID_SUBCATEGORIES.includes(subcategory)) {
    return isRequired ? 'Valid subcategory is required' : 'Invalid subcategory';
  }

  return null;
};

const validateFrequency = (frequency: { type: FrequencyType; targetDays?: number[] } | undefined, isRequired: boolean = true): string | null => {
  if (isRequired && !frequency) {
    return 'Frequency is required';
  }

  if (!frequency) return null;

  if (!isValidFrequency(frequency.type)) {
    return 'Frequency must be either "daily" or "weekly"';
  }

  if (frequency.type === 'weekly') {
    if (!frequency.targetDays || frequency.targetDays.length === 0) {
      return 'Target days are required for weekly frequency';
    }

    // Validate each day is between 0-6 (Sunday-Saturday)
    const validDays = frequency.targetDays.every(day =>
      Number.isInteger(day) && day >= 0 && day <= 6
    );

    if (!validDays) {
      return 'Target days must be valid weekday numbers (0-6)';
    }

    // Check for duplicates
    const uniqueDays = new Set(frequency.targetDays);
    if (uniqueDays.size !== frequency.targetDays.length) {
      return 'Target days cannot contain duplicates';
    }
  }

  if (frequency.type === 'daily' && frequency.targetDays && frequency.targetDays.length > 0) {
    return 'Target days should not be specified for daily frequency';
  }

  return null;
};

const validateDates = (startAt?: Date, endAt?: Date, pauseUntil?: Date): string | null => {
  if (startAt && !isValidDate(startAt)) {
    return 'Invalid start date';
  }

  if (endAt && !isValidDate(endAt)) {
    return 'Invalid end date';
  }

  if (pauseUntil && !isValidDate(pauseUntil)) {
    return 'Invalid pause until date';
  }

  if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
    return 'End date must be after start date';
  }

  return null;
};

const validateNotificationTime = (notificationTime: string | undefined): string | null => {
  if (notificationTime && !isValidTimeFormat(notificationTime)) {
    return 'Invalid notification time format. Use HH:MM';
  }
  return null;
};

export function validateCreateHabitInput(input: CreateHabitInput): string | null {
  // Validate required fields
  let error = validateName(input.name, true);
  if (error) return error;

  error = validateCategory(input.category, true);
  if (error) return error;

  error = validateSubcategory(input.subcategory, true);
  if (error) return error;

  error = validateFrequency(input.frequency, true);
  if (error) return error;

  // Validate optional fields
  error = validateDescription(input.description);
  if (error) return error;

  error = validateDates(input.startAt, input.endAt, input.pauseUntil);
  if (error) return error;

  error = validateNotificationTime(input.notificationTime);
  if (error) return error;

  return null;
}

export function validateUpdateHabitInput(input: UpdateHabitInput): string | null {
  if (!input) {
    return 'No input provided';
  }

  // Validate fields only if they are provided (all optional for updates)
  let error = validateName(input.name, false);
  if (error) return error;

  error = validateCategory(input.category, false);
  if (error) return error;

  error = validateSubcategory(input.subcategory, false);
  if (error) return error;

  error = validateFrequency(input.frequency, false);
  if (error) return error;

  error = validateDescription(input.description);
  if (error) return error;

  error = validateDates(undefined, input.endAt, input.pauseUntil);
  if (error) return error;

  error = validateNotificationTime(input.notificationTime);
  if (error) return error;

  return null;
}

export function validateToggleHabitInput(input: any): string | null {
  if (!input.habitId || input.habitId <= 0) {
    return 'Valid habit ID is required';
  }

  if (!input.date) {
    return 'Date is required';
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input.date)) {
    return 'Invalid date format. Use YYYY-MM-DD';
  }

  const parsedDate = new Date(input.date);
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  if (input.mood !== undefined) {
    if (!Number.isInteger(input.mood) || input.mood < 1 || input.mood > 5) {
      return 'Mood must be an integer between 1 and 5';
    }
  }

  if (input.notes && input.notes.length > 500) {
    return 'Notes must be less than 500 characters';
  }

  return null;
}

export const validateUpdateProfileInput = (input: UpdateProfileInput): string | null => {
  if (input.name !== undefined) {
    if (!input.name || input.name.trim().length < 1) {
      return 'Name cannot be empty';
    }
    if (input.name.trim().length > 100) {
      return 'Name cannot exceed 100 characters';
    }
  }

  if (input.timezone !== undefined) {
    if (!input.timezone) {
      return 'Timezone cannot be empty';
    }
    if (!isValidTimezone(input.timezone)) {
      return 'Invalid timezone';
    }
  }

  return null;
};

export const validateUpdateSettingsInput = (input: UpdateSettingsInput): string | null => {
  if (input.emailNotifications !== undefined && typeof input.emailNotifications !== 'boolean') {
    return 'emailNotifications must be a boolean';
  }

  if (input.publicProfile !== undefined && typeof input.publicProfile !== 'boolean') {
    return 'publicProfile must be a boolean';
  }

  if (input.quietHoursEnabled !== undefined && typeof input.quietHoursEnabled !== 'boolean') {
    return 'quietHoursEnabled must be a boolean';
  }

  if (input.quietHoursStart && !isValidTimeFormat(input.quietHoursStart)) {
    return 'Invalid quietHoursStart format. Use HH:MM (24-hour format)';
  }

  if (input.quietHoursEnd && !isValidTimeFormat(input.quietHoursEnd)) {
    return 'Invalid quietHoursEnd format. Use HH:MM (24-hour format)';
  }

  return null;
};

export const validateHabitHistoryQuery = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) {
    return 'startDate and endDate are required';
  }

  if (!isValidDateString(startDate)) {
    return 'Invalid startDate format. Use YYYY-MM-DD';
  }

  if (!isValidDateString(endDate)) {
    return 'Invalid endDate format. Use YYYY-MM-DD';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return 'startDate cannot be after endDate';
  }

  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 366) {
    return 'Date range cannot exceed 366 days';
  }

  return null;
};
