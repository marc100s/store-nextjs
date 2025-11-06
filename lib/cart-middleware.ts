import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware to handle session cart management
 * This was moved out of NextAuth authorized callback for separation of concerns
 */
export function cartMiddleware(request: NextRequest) {
  // Check for session cart cookie
  if (!request.cookies.get("sessionCartId")) {
    // Generate new session cart id cookie (compatible with AWS Amplify) - Cryptographically secure
    const sessionCartId = crypto.randomUUID().replace(/-/g, "");

    // Create new response
    const response = NextResponse.next();

    // Set newly generated sessionCartId in the response cookies
    response.cookies.set("sessionCartId", sessionCartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  }

  return NextResponse.next();
}

/**
 * Check if request should have cart middleware applied
 */
export function shouldApplyCartMiddleware(pathname: string): boolean {
  // Apply cart middleware to all pages except API routes and static files
  const excludePatterns = [
    /^\/api\//,
    /^\/_next\//,
    /^\/favicon\.ico$/,
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
  ];

  return !excludePatterns.some((pattern) => pattern.test(pathname));
}
