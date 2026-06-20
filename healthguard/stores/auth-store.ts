"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies";
import { authApi, setAuthToken, clearAuthToken } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, _role: UserRole) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);

          if (!response.success || !response.data) {
            throw new Error(response.error || "Login failed");
          }

          const { user, accessToken } = response.data;

          // Convert backend role format to frontend format
          const frontendRole = user.role.toLowerCase() as UserRole;

          const userData: User = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: frontendRole,
            avatar: user.avatar,
          };

          // Store token and user
          setAuthToken(accessToken);
          setAuthCookies(frontendRole);

          set({ user: userData, token: accessToken, isLoading: false });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Authentication failed. Please try again.";
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (err) {
          console.error("Logout API call failed:", err);
        }

        clearAuthToken();
        clearAuthCookies();
        set({ user: null, token: null, error: null });
      },

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    { name: "spms-auth" }
  )
);
