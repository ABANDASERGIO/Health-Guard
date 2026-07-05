"use client";

import { useEffect } from "react";
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

   useEffect(() => {
     fetch();
   }, [fetch]);

   const scoped = selectNotificationsForRole(role, items);

   return (
     <div className="space-y-8">
       <PageHeader
         title="Notifications"
         description="Security events, directory updates, and platform notices for administrators."
       />
       <EncryptionBanner variant="compact" />
       <NotificationsList
         items={scoped}
         onMarkRead={markRead}
         onMarkAllRead={markAllRead}
       />
     </div>
   );
 }
