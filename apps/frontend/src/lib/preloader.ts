import { queryClient, queryKeys } from './query-client';
import { api } from './api';

class DataPreloader {
  private preloadPromises: Map<string, Promise<unknown>> = new Map();

  async preloadHabits() {
    const key = 'habits';
    if (!this.preloadPromises.has(key)) {
      const promise = queryClient.prefetchQuery({
        queryKey: queryKeys.habits,
        queryFn: api.habits.getAll,
        staleTime: 2 * 60 * 1000,
      });
      this.preloadPromises.set(key, promise);
    }
    return this.preloadPromises.get(key);
  }

  async preloadBadges() {
    const key = 'badges';
    if (!this.preloadPromises.has(key)) {
      const promise = queryClient.prefetchQuery({
        queryKey: queryKeys.badges,
        queryFn: api.badges?.getDefinitions || (() => Promise.resolve([])),
        staleTime: 5 * 60 * 1000,
      });
      this.preloadPromises.set(key, promise);
    }
    return this.preloadPromises.get(key);
  }

  async preloadUserBadges() {
    const key = 'user-badges';
    if (!this.preloadPromises.has(key)) {
      const promise = queryClient.prefetchQuery({
        queryKey: ['user', 'badges'],
        queryFn: api.badges?.getAll,
        staleTime: 5 * 60 * 1000,
      });
      this.preloadPromises.set(key, promise);
    }
    return this.preloadPromises.get(key);
  }

  async preloadAllCategories() {
    const key = 'categories';
    if (!this.preloadPromises.has(key)) {
      const promise = queryClient.prefetchQuery({
        queryKey: queryKeys.categories,
        queryFn: api.categories?.getAll,
        staleTime: 5 * 60 * 1000,
      });
      this.preloadPromises.set(key, promise);
    }
    return this.preloadPromises.get(key);
  }

  async preloadProfile() {
    const key = 'profile';
    if (!this.preloadPromises.has(key)) {
      const promise = queryClient.prefetchQuery({
        queryKey: queryKeys.user.profile,
        queryFn: api.user?.getProfile,
        staleTime: 5 * 60 * 1000,
      });
      this.preloadPromises.set(key, promise);
    }
    return this.preloadPromises.get(key);
  }

  async preloadEssentials() {
    console.log('🔄 Starting preload of essential data...');
    try {
      const results = await Promise.allSettled([
        this.preloadHabits(),
        this.preloadUserBadges(),
        this.preloadBadges(),
        this.preloadAllCategories(),
      ]);
    } catch (error) {
      console.warn('Preloading failed:', error);
    }
  }

  preloadOnHover(target: 'calendar' | 'profile') {
    switch (target) {
      case 'calendar':
        break;
      case 'profile':
        this.preloadProfile()
        break;
    }
  }

  clearCache() {
    this.preloadPromises.clear();
  }
}

export const preloader = new DataPreloader();