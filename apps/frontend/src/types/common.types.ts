import { HabitCategory } from "./habit.types";

export interface DateRangeParams {
    startDate: string;
    endDate: string;
  }
  
  // Pagination types
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }
  
  // Filter types
  export interface HabitFilters {
    category?: HabitCategory;
    status?: 'active' | 'paused' | 'deleted' | 'ended';
    createdAfter?: string;
    createdBefore?: string;
    hasStreak?: boolean;
  }
  
  // Form validation
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface FormErrors {
    [key: string]: string;
  }
  