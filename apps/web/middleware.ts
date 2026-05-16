/**
 * Next.js Edge Middleware — route protection for authenticated app routes.
 *
 * Logic:
 * 1. Public routes bypass all checks.
 * 2. Authenticated routes require a valid access_token cookie.
 * 3. If only a refresh_token exists, attempt /auth/refresh server-side.
 * 4. On any failure → redirect to /login with `?next=<original-path>`.
 *
 * Tokens are stored as httpOnly cookies (set by the API on login/register).
 * The access_token is a short-lived JWT; the refresh_token is longer-lived.
 */

import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

/** Paths that start with these prefixes are always public */
const PUBLIC_PREFIXES = ["/_next", "/api/", "/favicon", "/manifest", "/icons"];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.revizr.co.uk/v1";

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Happy path — access token present
  if (accessToken) {
    return NextResponse.next();
  }

  // No access token — try to refresh if we have a refresh token
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };

        const response = NextResponse.next();
        // Set new access_token cookie — httpOnly, secure, sameSite strict
        response.cookies.set("access_token", data.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: data.expires_in,
          path: "/",
        });
        if (data.refresh_token && data.refresh_token !== refreshToken) {
          response.cookies.set("refresh_token", data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
          });
        }
        return response;
      }
    } catch {
      // Network error — fall through to redirect
    }
  }

  // No valid session — redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, manifest.json, icons/*
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|icons/).*)",
  ],
};
