"use client";

import { format } from "date-fns";
import { Activity as ActivityIcon, Globe, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { ActivityLogEntry } from "@/types";

export default function PatientActivityPage() {
   const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

   useEffect(() => {
    (async () => {
      const { patientApi } = await import("@/lib/api-client");
      const response = await patientApi.getActivityLogs();
      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data as ActivityLogEntry[]);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity & audit logs"
        description="Immutable-style timeline for PHI touches, authentications, and patient-approved disclosures."
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="size-5 text-primary" />
            Live activity feed
          </CardTitle>
          <CardDescription>Includes clinician viewers, security markers, and self-service actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-6 border-l border-border pl-8">
            <span className="absolute left-[-7px] top-2 size-3 rounded-full bg-primary shadow-[0_0_0_6px_var(--background)]" />
{logs.map((log, idx) => (
               <div key={log.id} className="relative">
                 {idx !== 0 ? (
                   <span className="absolute left-[-31px] top-8 size-3 rounded-full bg-muted ring-4 ring-background" />
                 ) : null}
                 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                   <div className="flex flex-wrap items-center gap-2">
                     <p className="font-semibold">{log.actor}</p>
                     <Badge variant="outline">{format(new Date(log.timestamp), "MMM d, yyyy · HH:mm")}</Badge>
                     <Badge variant="primary" className="gap-1">
                       <Shield className="size-3" /> Audited
                     </Badge>
                   </div>
                   <p className="mt-2 text-sm text-muted">
                     <span className="font-medium text-foreground">{log.action}</span> · {log.resource}
                   </p>
                   {log.ip ? (
                     <p className="mt-3 flex items-center gap-2 text-xs text-muted">
                       <Globe className="size-3.5" /> Source IP {log.ip}
                     </p>
                   ) : null}
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>

      <Card>
         <CardHeader>
           <CardTitle>Structured audit export</CardTitle>
           <CardDescription>Production deployments stream these rows to your SIEM · CSV export mocked below.</CardDescription>
         </CardHeader>
         <CardContent className="overflow-x-auto rounded-xl border border-border">
           <table className="w-full text-sm">
             <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
               <tr>
                 <th className="px-4 py-3 text-left">Timestamp</th>
                 <th className="px-4 py-3 text-left">Actor</th>
                 <th className="px-4 py-3 text-left">Action</th>
                 <th className="px-4 py-3 text-left">Resource</th>
               </tr>
             </thead>
             <tbody>
               {logs.map((log) => (
                 <tr key={`${log.id}-table`} className="border-t border-border">
                   <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                     {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm")}
                   </td>
                   <td className="px-4 py-3">{log.actor}</td>
                   <td className="px-4 py-3">{log.action}</td>
                   <td className="px-4 py-3">{log.resource}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </CardContent>
       </Card>
     </div>
   );
 }
