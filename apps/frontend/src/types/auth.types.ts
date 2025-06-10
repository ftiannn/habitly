import { User } from "./user.types";

export interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BackendAuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    message?: string;
  }
  

export interface AuthResponse {
  token: string; 
  refreshToken: string;
  user: User;
}

export interface GoogleAuthRequest {
  idToken: string;
}

