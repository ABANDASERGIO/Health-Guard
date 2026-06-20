import { Suspense } from "react";
import { OtpPageClient } from "./otp-page-client";

export default function DoctorAccessOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted">
          Loading OTP challenge…
        </div>
      }
    >
      <OtpPageClient />
    </Suspense>
  );
}
