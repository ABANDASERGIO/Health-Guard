"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { notificationsPathForRole } from "@/lib/notification-routes";
import { useAuthStore } from "@/stores/auth-store";
import {
  selectNotificationsForRole,
  unreadCountForRole,
  useNotificationsStore,
} from "@/stores/notifications-store";
import { Button } from "@/components/ui/button";

export function NotificationsDropdown() {
  const user = useAuthStore((s) => s.user);
  const fetch = useNotificationsStore((s) => s.fetch);
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);

  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) {
      fetch();
      setLoaded(true);
    }
  }, [fetch, loaded, user?.role]);

  const role = user?.role;
  const scoped = selectNotificationsForRole(role, items)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unread = unreadCountForRole(role, items);
  const preview = scoped.slice(0, 6);
  const href = notificationsPathForRole(role);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative size-10 p-0"
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-card">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,380px)] rounded-2xl border border-border bg-card py-2 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notifications</p>
            <Link
              href={href}
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <ul className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
            {preview.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">No notifications</li>
            ) : (
              preview.map((n) => (
                <li key={n.id}>
                  <Link
                    href={href}
                    className={cn(
                      "block px-4 py-3 text-left transition-colors hover:bg-muted-bg",
                      !n.read && "bg-primary/5"
                    )}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{n.description}</p>
                    <p className="mt-2 text-[10px] text-muted">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
