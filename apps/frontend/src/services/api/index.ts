export * from './api-client.service';
export * from './auth.service';

import { apiClient, localStorageFallback } from './api-client.service';
import authService from './auth.service';

const api = {
  client: apiClient,
  localStorage: localStorageFallback,
  auth: authService,
};

export default api;