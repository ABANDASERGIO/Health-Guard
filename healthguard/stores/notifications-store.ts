"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notificationApi } from "@/lib/api-client";
import type { UserRole } from "@/types";

export interface NotificationRecord {
  id: string;
  title: string;
  description: string;
  type: "access" | "health" | "message" | "security" | "system";
  read: boolean;
  createdAt: string;
  audience: UserRole;
  link?: string;
}

interface NotificationsState {
  items: NotificationRecord[];
  loading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  add: (n: Omit<NotificationRecord, "id" | "createdAt">) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetch: async () => {
        set({ loading: true });
        try {
          const response = await notificationApi.getNotifications();
          if (response.success && Array.isArray(response.data)) {
            set({ items: response.data as NotificationRecord[] });
          }
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        } finally {
          set({ loading: false });
        }
      },

      markRead: async (id) => {
        await notificationApi.markRead(id);
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        }));
      },

      markAllRead: async () => {
        await notificationApi.markAllRead();
        set((state) => ({
          items: state.items.map((item) => ({ ...item, read: true })),
        }));
      },

      add: async (n) => {
        const tempId = `local-${Date.now()}`;
        set((state) => ({
          items: [{ ...n, id: tempId, createdAt: new Date().toISOString() }, ...state.items],
        }));
      },
    }),
    {
      name: "spms-notifications",
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export function selectNotificationsForRole(role: UserRole | undefined, items: NotificationRecord[]) {
  if (!role) return [];
  const normalizedRole = role.toLowerCase();
  return items.filter((i) => i.audience.toLowerCase() === normalizedRole);
}

export function unreadCountForRole(role: UserRole | undefined, items: NotificationRecord[]) {
  if (!role) return 0;
  const normalizedRole = role.toLowerCase();
  return items.filter((i) => i.audience.toLowerCase() === normalizedRole && !i.read).length;
}