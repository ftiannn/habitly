import { apiClient } from '@/services/api/api-client.service';
import { AuthResponse, BackendResponse, BadgeWithProgress, Category, CreateHabitRequest, Habit, HabitHistory, ToggleCompletionRequest, ToggleCompletionResponse, UpdateHabitRequest, UpdateProfileRequest, UpdateUserSettingsRequest, User, UserBadgesResponse, UserSettings } from '@/types';

export const api = {
  habits: {
    getAll: async () => {
      const response = await apiClient.get<BackendResponse<{ habits: Habit[] }>>('/habits');
      return response.data.habits;
    },
    getById: async (id: string): Promise<Habit> => {
      const response = await apiClient.get<BackendResponse<Habit>>(`/habits/${id}`);
      return response.data;
    },

    create: async (data: CreateHabitRequest): Promise<Habit> => {
      const response = await apiClient.post<BackendResponse<Habit>>('/habits', data);
      return response.data;
    },

    update: async (id: string, data: UpdateHabitRequest): Promise<Habit> => {
      const response = await apiClient.patch<BackendResponse<Habit>>(`/habits/${id}`, data);
      return response.data;
    },

    delete: async (id: string): Promise<{ message: string; habitId: number }> => {
      return await apiClient.delete(`/habits/${id}`);
    },

    toggleCompletion: async (data: ToggleCompletionRequest): Promise<ToggleCompletionResponse> => {
      return await apiClient.post('/habits/toggle', data);
    },

    getHistory: async (startDate: string, endDate: string): Promise<HabitHistory> => {
      const response = await apiClient.get<BackendResponse<HabitHistory>>(`/habits/history?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    },

  },

  badges: {
    getDefinitions: async (): Promise<BadgeWithProgress[]> => {
      const response = await apiClient.get<BackendResponse<{ badges: BadgeWithProgress[] }>>('/badges/definitions');
      return response.data.badges;
    },

    getAll: async (): Promise<UserBadgesResponse> => {
      const response = await apiClient.get<BackendResponse<{ badges: UserBadgesResponse }>>('/badges/user');
      return response.data.badges;
    },
  },


  user: {
    googleLogin: async (data: { code: string; redirectUri: string }): Promise<AuthResponse> => {
      return await apiClient.post('/auth/google', data);
    },

    logout: async (): Promise<{ message: string }> => {
      return await apiClient.post('/auth/logout', {});
    },

    getProfile: async (): Promise<User> => {
      const response = await apiClient.get<BackendResponse<User>>('/auth/me');
      return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
      const response = await apiClient.put<BackendResponse<User>>('/auth/profile', data);
      return response.data;
    },

    getSettings: async (): Promise<UserSettings> => {
      const response = await apiClient.get<BackendResponse<{settings: UserSettings}>>('/users/settings');
      return response.data.settings;
    },

    updateSettings: async (data: UpdateUserSettingsRequest): Promise<UserSettings> => {
      const response = await apiClient.patch<BackendResponse<UserSettings>>('/users/settings', data);
      return response.data;
    },
  },

  categories: {
    getAll: async (): Promise<Category[]> => {
      const response = await apiClient.get<BackendResponse<{ categories: Category[] }>>('/categories');
      return response.data.categories;
    }
  },
}
