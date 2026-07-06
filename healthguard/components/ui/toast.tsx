"use client";

import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

export function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-2xl border p-4 shadow-xl backdrop-blur transition-all",
            toast.variant === "success"
              ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-900"
              : "border-danger/40 bg-danger/10 text-danger"
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
