"use client";

import { format } from "date-fns";
import {
  Bell,
  HeartPulse,
  Lock,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { NotificationItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const iconFor = (type: NotificationItem["type"]) => {
  switch (type) {
    case "access":
      return Lock;
    case "health":
      return HeartPulse;
    case "message":
      return MessageSquare;
    case "security":
      return ShieldAlert;
    default:
      return Sparkles;
  }
};

export function NotificationsList({
  items,
  onMarkRead,
  onMarkAllRead,
}: {
  items: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {unread > 0 ? `${unread} unread` : "All caught up"}
        </p>
        {unread > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted">No notifications yet.</CardContent>
          </Card>
        ) : (
          items.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <div
                key={n.id}
                role="presentation"
                onClick={() => !n.read && onMarkRead(n.id)}
                className={`cursor-pointer rounded-2xl transition-opacity ${
                  n.read ? "opacity-80" : "border-primary/40 shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                }`}
              >
                <Card className="h-full border-0 shadow-none ring-0">
                  <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted-bg ring-1 ring-border">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{n.title}</p>
                          {!n.read ? (
                            <Badge variant="primary" className="gap-1">
                              <Bell className="size-3" /> New
                            </Badge>
                          ) : (
                            <Badge variant="outline">Read</Badge>
                          )}
                          <Badge variant="outline">{n.type}</Badge>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm text-muted">{n.description}</p>
                        <p className="mt-3 text-xs text-muted">
                          {format(new Date(n.createdAt), "MMM d, yyyy · HH:mm")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
