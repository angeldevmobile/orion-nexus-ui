import { createContext } from "react";
import type { UserPreferences } from "@/types/auth";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  github_id?: string;
  has_password?: boolean;
  preferences?: UserPreferences;
}

export type AuthContextType = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
