/**
 * Environment configuration for the application
 * These values can be overridden by environment variables in production
 */


export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 10000,
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || false
};

export const API_URL = API_CONFIG.BASE_URL;

export const AUTH_CONFIG = {
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID: import.meta.env.VITE_GOOGLE_ANDROID_CLIENT_ID || '',
};

export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_TEST = import.meta.env.MODE === 'test';

export default {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST
};