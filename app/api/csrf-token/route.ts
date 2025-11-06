import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";

/**
 * GET /api/csrf-token
 * Provides CSRF token for client-side applications
 * The token is also set as httpOnly cookie for server-side validation
 */
export async function GET(request: NextRequest) {
  try {
    // Check if token already exists in cookie
    const existingToken = request.cookies.get("__Host-csrf-token")?.value;

    let token: string;
    const response = NextResponse.json({ csrfToken: existingToken || "" });

    if (existingToken) {
      token = existingToken;
      response.json = () => Promise.resolve({ csrfToken: token });
    } else {
      // Generate new token
      token = generateCSRFToken();

      // Set httpOnly cookie
      response.cookies.set("__Host-csrf-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      // Return token in response body for client use
      return NextResponse.json({ csrfToken: token });
    }

    return NextResponse.json({ csrfToken: token });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
