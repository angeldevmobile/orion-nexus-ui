import React, { useState, useEffect } from "react";
import { AuthContext, UserProfile } from "./AuthContextType";
import type { UserPreferences } from "@/types/auth";

const ACCENT_COLORS: Record<string, string> = {
  cyan:   "198 93% 60%",
  blue:   "217 91% 60%",
  purple: "270 91% 65%",
  green:  "142 71% 45%",
  orange: "25 95% 53%",
};

function applyAppearance(prefs: UserPreferences | undefined) {
  const root = document.documentElement;

  // Theme
  const appTheme = prefs?.appTheme ?? "dark";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = appTheme === "dark" || (appTheme === "auto" && prefersDark);
  root.classList.toggle("light", !isDark);

  // Accent color
  const accentColor = prefs?.accentColor ?? "cyan";
  const hsl = ACCENT_COLORS[accentColor] ?? ACCENT_COLORS.cyan;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--accent", hsl);
  root.style.setProperty("--ring", hsl);
  root.style.setProperty("--sidebar-primary", hsl);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      const parsedUser: UserProfile = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      setIsAuthenticated(true);
      applyAppearance(parsedUser.preferences);
    }
  }, []);

  // Re-apply whenever user preferences change
  useEffect(() => {
    applyAppearance(user?.preferences);
  }, [user]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    applyAppearance(undefined); // reset to defaults
  };

  const updateUser = (updatedUser: UserProfile) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
