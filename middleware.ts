import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  cartMiddleware,
  shouldApplyCartMiddleware,
} from "@/lib/cart-middleware";
import {
  applySecurityHeaders,
  botProtection,
  shouldApplyEnhancedSecurity,
  getEnvironmentSpecificHeaders,
} from "@/lib/security-headers";

/**
 * Main middleware function - coordinates all security measures
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV === "development";

  // 1. Bot protection (early exit for blocked bots)
  const botResponse = botProtection(request);
  if (botResponse) {
    return botResponse;
  }

  // 2. Rate limiting for API and sensitive routes
  if (pathname.startsWith("/api/")) {
    let rateLimitType: "api" | "auth" | "upload" | "webhook" = "api";

    if (pathname.includes("/auth/")) {
      rateLimitType = "auth";
    } else if (pathname.includes("/upload")) {
      rateLimitType = "upload";
    } else if (pathname.includes("/webhooks/")) {
      rateLimitType = "webhook";
    }

    const rateLimitResult = await checkRateLimit(request, rateLimitType);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime);

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Try again after ${resetDate.toISOString()}`,
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
  }

  // 3. Cart middleware (session management)
  let response: NextResponse;
  if (shouldApplyCartMiddleware(pathname)) {
    response = cartMiddleware(request);
  } else {
    response = NextResponse.next();
  }

  // 4. Apply security headers
  if (shouldApplyEnhancedSecurity(pathname)) {
    const headers = getEnvironmentSpecificHeaders(isDev, pathname);
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        response.headers.set(key, value);
      }
    });
  } else {
    // Apply basic security headers to all responses
    response = applySecurityHeaders(response);
  }

  // 5. Additional security for sensitive routes
  if (shouldApplyEnhancedSecurity(pathname)) {
    // Add extra cache control for sensitive pages
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
