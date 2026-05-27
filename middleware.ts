import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/applicant",
  "/restaurant",
  "/admin",
  "/profile",
  "/messaging",
  "/applications",
  "/payments",
  "/file-management",
  "/security",
];

// Routes only accessible when NOT logged in
const AUTH_ONLY_ROUTES = ["/auth/login", "/auth/register", "/auth/reset-password"];

// Routes only accessible by admins
const ADMIN_ROUTES = ["/admin"];

// Routes only accessible by restaurant users
const RESTAURANT_ROUTES = ["/restaurant"];

// Routes only accessible by applicants
const APPLICANT_ROUTES = ["/applicant"];

// Public routes that don't need any checks
const PUBLIC_ROUTES = ["/", "/about", "/contact", "/privacy", "/terms", "/pricing"];

interface SessionClaims {
  role?: "admin" | "restaurant" | "applicant";
  email?: string;
  uid?: string;
}

function decodeSessionCookie(cookie: string): SessionClaims | null {
  try {
    // Session cookie is a JWT token - decode the payload
    const parts = cookie.split(".");
    if (parts.length !== 3) return null;

    const payload = Buffer.from(parts[1], "base64").toString("utf-8");
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

function getSecurityHeaders(request: NextRequest) {
  const headers = new Headers();
  
  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");
  
  // Prevent clickjacking - but only in production (dev preview needs iframe)
  if (process.env.NODE_ENV === "production") {
    headers.set("X-Frame-Options", "DENY");
    headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  }
  
  // XSS Protection
  headers.set("X-XSS-Protection", "1; mode=block");
  
  // Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions Policy - restrict unnecessary features
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // HSTS - only in production with HTTPS
  if (process.env.NODE_ENV === "production" && request.nextUrl.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get("session")?.value;
  const isAuthenticated = !!sessionCookie;
  
  // Decode session to get user claims
  const claims = sessionCookie ? decodeSessionCookie(sessionCookie) : null;
  const userRole = claims?.role;

  // 1. Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from auth-only pages
  const isAuthOnly = AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthOnly && isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = "/";
    if (userRole === "admin") {
      redirectPath = "/admin/dashboard";
    } else if (userRole === "restaurant") {
      redirectPath = "/restaurant/dashboard";
    } else if (userRole === "applicant") {
      redirectPath = "/applicant/dashboard";
    }
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 3. Role-based access control for admin routes
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute && isAuthenticated && userRole !== "admin") {
    // Not an admin - redirect to unauthorized page
    return NextResponse.redirect(new URL("/auth/login?error=unauthorized", request.url));
  }

  // 4. Role-based access control for restaurant routes
  const isRestaurantRoute = RESTAURANT_ROUTES.some((route) => pathname.startsWith(route));
  if (isRestaurantRoute && isAuthenticated && userRole !== "restaurant") {
    return NextResponse.redirect(new URL("/auth/login?error=unauthorized", request.url));
  }

  // 5. Role-based access control for applicant routes
  const isApplicantRoute = APPLICANT_ROUTES.some((route) => pathname.startsWith(route));
  if (isApplicantRoute && isAuthenticated && userRole !== "applicant") {
    return NextResponse.redirect(new URL("/auth/login?error=unauthorized", request.url));
  }

  // 6. Add security headers to all responses
  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders(request);
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  // 7. Additional API route security
  if (pathname.startsWith("/api/")) {
    // No-cache for API responses
    response.headers.set("Cache-Control", "no-store, max-age=0");
    
    // Add CORS headers for API routes if needed
    response.headers.set("Access-Control-Allow-Credentials", "true");
    
    // Rate limiting headers (actual rate limiting would be done in API routes)
    response.headers.set("X-RateLimit-Limit", "100");
  }

  // 8. Add custom headers for debugging (development only)
  if (process.env.NODE_ENV === "development") {
    response.headers.set("X-Middleware-Auth", isAuthenticated ? "true" : "false");
    if (userRole) {
      response.headers.set("X-Middleware-Role", userRole);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - API routes handled separately
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|ico)$).*)",
  ],
};