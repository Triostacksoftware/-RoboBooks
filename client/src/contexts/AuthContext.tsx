"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  role?: string;
  approvalStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // Check if we have a token in localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Try to get user info from API
      const response = await api("/api/auth/me");
      if (response.success && response.user) {
        setUser(response.user);
        // Update localStorage with fresh user data
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    emailOrPhone: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await api("/api/auth/login", {
        method: "POST",
        json: { emailOrPhone, password },
      });

      if (response.success && response.user) {
        setUser(response.user);

        // Store token and user data
        if (response.accessToken) {
          localStorage.setItem("token", response.accessToken);
        }
        localStorage.setItem("user", JSON.stringify(response.user));

        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Starting logout process...");

      // Call the logout API to clear server-side session
      await api("/api/auth/logout", { method: "POST" });
      console.log("✅ Server logout successful");
    } catch (error) {
      console.error("❌ Logout API call failed:", error);
      // Continue with logout even if API call fails
    }

    // Clear local state and storage
    console.log("🗑️ Clearing local storage...");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear(); // Clear any session storage as well

    // Force a complete page reload to clear any cached state
    console.log("🔄 Redirecting to signin page...");
    window.location.replace("/signin");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
