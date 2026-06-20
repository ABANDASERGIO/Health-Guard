"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/types";
import type { SeededNotification } from "@/mock-data/notifications-seed";
import { notificationsSeed } from "@/mock-data/notifications-seed";

interface NotificationsState {
  items: SeededNotification[];
  markRead: (id: string) => void;
  markAllReadForRole: (role: UserRole) => void;
  addNotification: (n: Omit<SeededNotification, "read"> & { read?: boolean }) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      items: [...notificationsSeed],

      markRead: (id) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
        })),

      markAllReadForRole: (role) =>
        set((state) => ({
          items: state.items.map((i) => (i.audience === role ? { ...i, read: true } : i)),
        })),

      addNotification: (n) =>
        set((state) => ({
          items: [{ ...n, read: n.read ?? false }, ...state.items],
        })),
    }),
    {
      name: "spms-notifications",
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export function selectNotificationsForRole(role: UserRole | undefined, items: SeededNotification[]) {
  if (!role) return [];
  return items.filter((i) => i.audience === role);
}

export function unreadCountForRole(role: UserRole | undefined, items: SeededNotification[]) {
  if (!role) return 0;
  return items.filter((i) => i.audience === role && !i.read).length;
}
