import { Suspense } from "react";
import { StatusPageClient } from "./status-page-client";

export default function DoctorAccessStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
          Loading secure workflow…
        </div>
      }
    >
      <StatusPageClient />
    </Suspense>
  );
}
