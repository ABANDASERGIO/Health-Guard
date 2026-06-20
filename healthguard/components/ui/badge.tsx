"use client";

import { cn } from "@/lib/utils";

const variants = {
  default: "bg-muted-bg text-foreground border border-border",
  primary: "bg-primary/15 text-primary border border-primary/30",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/25",
  danger: "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25",
  outline: "border border-border text-muted",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
