"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationsSettingsState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useNotificationsSettingsStore = create<NotificationsSettingsState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: "spms-notifications-settings",
      partialize: (s) => ({ enabled: s.enabled }),
    }
  )
);

