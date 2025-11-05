import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders, getEnvironmentSpecificHeaders } from './lib/security-headers';

const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
  // Apply authentication middleware first
  const authResult = await auth(request as any);
  
  let response: NextResponse;
  
  // If auth middleware returns a response, use it (redirect, etc.)
  if (authResult instanceof NextResponse) {
    response = authResult;
  } else {
    // Create a new response
    response = NextResponse.next();
    
    // Handle cart session generation (replicate authConfig logic)
    if (!request.cookies.get('sessionCartId')) {
      const sessionCartId = crypto.randomUUID().replace(/-/g, '');
      response.cookies.set('sessionCartId', sessionCartId, {
        httpOnly: false, // Allow client-side access for cart functionality
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
  }
  
  // Apply security headers based on environment
  const isDev = process.env.NODE_ENV === 'development';
  const headers = getEnvironmentSpecificHeaders(isDev, request.nextUrl.pathname);
  
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    } else {
      response.headers.delete(key);
    }
  });
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except static files and API routes that don't need auth
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
