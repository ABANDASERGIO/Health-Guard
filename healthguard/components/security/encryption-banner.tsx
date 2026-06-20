"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EncryptionBanner({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-900 dark:text-emerald-100",
          className
        )}
      >
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        <span>Encrypted channel · PHI protected</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-accent-soft/40 p-5 shadow-inner",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-card shadow-sm ring-1 ring-border">
          <Lock className="size-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-foreground">Protected Health Information</p>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Data in transit and at rest is encrypted. Access is audited and role-restricted per HIPAA-style
            controls in this demonstration environment.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="primary">AES-256 UI</Badge>
            <Badge variant="success">JWT session</Badge>
            <Badge variant="outline">Audit logging</Badge>
          </div>
        </div>
      </div>
      <div className="hidden text-right text-xs text-muted lg:block">
        <p className="font-medium text-foreground">Secure Patient Monitoring System</p>
        <p className="mt-1">Session verified · Role-based access active</p>
      </div>
    </div>
  );
}
