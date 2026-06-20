import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-background text-sm text-muted">
          Preparing secure sign-in…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
