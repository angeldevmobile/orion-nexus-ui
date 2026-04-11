export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  appTheme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
  language: string;
  notifications: boolean;
  fontSize?: number;
  subscription?: 'free' | 'pro' | 'enterprise';
}

export interface UserProfile {
  bio?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface User {
  id: string;                   
  username: string;
  email: string;
  // password: omitido por seguridad
  avatar?: string;
  role: 'user' | 'admin';
  preferences?: UserPreferences;  
  profile?: UserProfile;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProfileUpdateRequest {
  username?: string;
  avatar?: string;
  preferences?: UserPreferences;
  profile?: UserProfile;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}