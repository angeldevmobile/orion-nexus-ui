export interface UserPreferences {
  theme: 'light' | 'dark';
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