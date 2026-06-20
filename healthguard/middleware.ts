import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HOME_BY_ROLE: Record<string, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("hg_session")?.value;
  const role = request.cookies.get("hg_role")?.value;

  const rules: { prefix: string; required: string }[] = [
    { prefix: "/patient", required: "patient" },
    { prefix: "/doctor", required: "doctor" },
    { prefix: "/admin", required: "admin" },
  ];

  for (const { prefix, required } of rules) {
    if (!pathname.startsWith(prefix)) continue;

    if (!session) {
      const login = new URL("/auth/login", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }

    if (role && role !== required) {
      const fallback = HOME_BY_ROLE[role] ?? "/auth/login";
      return NextResponse.redirect(new URL(fallback, request.url));
    }

    if (!role) {
      const login = new URL("/auth/login", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/admin/:path*"],
};
