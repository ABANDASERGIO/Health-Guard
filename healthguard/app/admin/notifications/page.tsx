"use client";

import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth-store";
import {
  selectNotificationsForRole,
  useNotificationsStore,
} from "@/stores/notifications-store";

export default function AdminNotificationsPage() {
   const role = useAuthStore((s) => s.user?.role);
   const items = useNotificationsStore((s) => s.items);
   const markRead = useNotificationsStore((s) => s.markRead);
   const markAllRead = useNotificationsStore((s) => s.markAllRead);
   const fetch = useNotificationsStore((s) => s.fetch);
   const [lastUpdated, setLastUpdated] = useState("");

   const refreshNotifications = async () => {
     await fetch();
     setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
   };

   useEffect(() => {
     refreshNotifications();
     const interval = window.setInterval(refreshNotifications, 60000);
     return () => window.clearInterval(interval);
   }, [fetch]);

   const scoped = selectNotificationsForRole(role, items);

   return (
     <div className="space-y-8">
       <PageHeader
         title="Notifications"
         description="Security events, directory updates, and platform notices for administrators."
       />
       <EncryptionBanner variant="compact" />
       <p className="text-sm text-muted">Live updates refresh every 60 seconds. Last updated {lastUpdated || "—"}.</p>
       <NotificationsList
         items={scoped}
         onMarkRead={markRead}
         onMarkAllRead={markAllRead}
       />
     </div>
   );
 }
