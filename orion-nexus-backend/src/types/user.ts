export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  fontSize?: number;
  subscription?: 'free' | 'pro' | 'business' | 'enterprise';
  // Créditos de IA
  credits_daily_remaining?: number;
  credits_monthly_remaining?: number;
  credits_daily_reset_at?: string;
  credits_monthly_reset_at?: string;
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
  password?: string; 
  avatar?: string;
  role: 'user' | 'admin';
  github_id?: string;
  preferences?: UserPreferences; 
  profile?: UserProfile;
  last_login?: string;
  created_at: string;
  updated_at: string;
}