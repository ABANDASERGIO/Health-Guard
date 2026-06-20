"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      <textarea
        ref={ref}
        className={cn(
          "min-h-[100px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-inner placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 dark:bg-card",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
);
Textarea.displayName = "Textarea";
