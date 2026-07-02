"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { systemLogs as seed } from "@/mock-data/admin";

export default function AdminLogsPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<"all" | "info" | "warn" | "error">("all");

  const rows = useMemo(() => {
    return seed.filter((l) => {
      const match =
        l.message.toLowerCase().includes(q.toLowerCase()) ||
        l.actor.toLowerCase().includes(q.toLowerCase()) ||
        l.source.toLowerCase().includes(q.toLowerCase());
      const lvl = level === "all" ? true : l.level === level;
      return match && lvl;
    });
  }, [q, level]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="System logs"
        description="Audit timeline with export-ready activity insights."
        actions={
          <Button type="button" variant="secondary" className="gap-2">
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Telemetry feed</CardTitle>
            <CardDescription>Search actor, subsystem, or narrative text.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <Input placeholder="Search logs…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
            <Button
              type="button"
              variant={level === "all" ? "outline" : "primary"}
              className="gap-2"
              onClick={() =>
                setLevel((prev) => (prev === "all" ? "error" : prev === "error" ? "warn" : prev === "warn" ? "info" : "all"))
              }
            >
              <Filter className="size-4" />
              {level === "all" ? "All levels" : level.toUpperCase()}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Actor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                    {format(new Date(l.ts), "yyyy-MM-dd HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        l.level === "error" ? "danger" : l.level === "warn" ? "warning" : "outline"
                      }
                    >
                      {l.level}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{l.source}</td>
                  <td className="px-4 py-3">{l.message}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted">No entries match your filters.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
