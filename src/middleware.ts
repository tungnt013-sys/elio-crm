import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Default landing page per role
function defaultPage(role: string | undefined): string {
  if (role === "COUNSELOR") return "/counselor";
  return "/sales"; // SALES, SALES_VIEW, ADMIN
}

// Routes each role is allowed to visit
function isAllowed(pathname: string, role: string | undefined): boolean {
  if (role === "ADMIN") return true;
  if (role === "COUNSELOR") {
    return (
      pathname.startsWith("/counselor") ||
      pathname.startsWith("/students") ||
      pathname.startsWith("/api")
    );
  }
  // SALES / SALES_VIEW
  return (
    pathname.startsWith("/sales") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/students") ||
    pathname.startsWith("/api")
  );
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".");

  if (isPublic) return;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // role lives on session.user (via session callback) or directly on the JWT token
  const role = (req.auth?.user?.role ?? (req.auth as { token?: { role?: string } } | null)?.token?.role) as string | undefined;

  // Redirect "/" to the role's default page
  if (pathname === "/") {
    return NextResponse.redirect(new URL(defaultPage(role), req.nextUrl));
  }

  // Block access to routes outside the user's allowed set
  if (!isAllowed(pathname, role)) {
    return NextResponse.redirect(new URL(defaultPage(role), req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
