"use client";

import { EncryptionBanner } from "@/components/security/encryption-banner";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth-store";
import {
  selectNotificationsForRole,
  useNotificationsStore,
} from "@/stores/notifications-store";
import { useNotificationsSettingsStore } from "@/stores/notifications-settings-store";

export default function PatientNotificationsPage() {
   const role = useAuthStore((s) => s.user?.role);
   const items = useNotificationsStore((s) => s.items);
   const markRead = useNotificationsStore((s) => s.markRead);
   const markAllRead = useNotificationsStore((s) => s.markAllRead);

   const fetch = useNotificationsStore((s) => s.fetch);
   void fetch; // keep reference; current page relies on store state


   const scoped = selectNotificationsForRole(role, items);

   const enabled = useNotificationsSettingsStore((s) => s.enabled);


   if (!enabled) {
     return (
       <div className="space-y-8">
         <PageHeader title="Notifications" description="Notifications are turned off in your settings." />
         <EncryptionBanner variant="compact" />
         <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted">
           Notifications fetching/display is disabled. Toggle it back on in Settings.
         </div>
       </div>
     );
   }

   return (
     <div className="space-y-8">
       <PageHeader
         title="Notifications"
         description="Access requests, health insights, secure messages, security notices, and platform updates."
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
