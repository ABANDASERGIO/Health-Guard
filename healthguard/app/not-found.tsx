import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Shield className="size-8" aria-hidden />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Secure Patient Monitoring System</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">404</h1>
        <p className="mt-4 text-muted">
          This route is not part of your secure workspace. If you followed a bookmarked PHI link, verify you are signed
          in with the correct role.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
