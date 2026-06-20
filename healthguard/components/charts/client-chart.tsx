"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Recharts measures containers during SSR/prerender where layout can be 0×0.
 * Defer rendering until mount so ResponsiveContainer gets a stable size.
 */
export function ClientChart({
  height,
  className,
  children,
}: {
  height: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn("w-full rounded-xl", className)} style={{ height }}>
        <Skeleton className="h-full min-h-[120px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-0 min-w-0 w-full", className)} style={{ height }}>
      {children}
    </div>
  );
}
