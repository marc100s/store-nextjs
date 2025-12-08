import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  cartMiddleware,
  shouldApplyCartMiddleware,
} from '@/lib/cart-middleware';
import {
  applySecurityHeaders,
  botProtection,
  shouldApplyEnhancedSecurity,
  getEnvironmentSpecificHeaders,
} from '@/lib/security-headers';

const { auth } = NextAuth(authConfig);

/**
 * Main proxy function - coordinates all security measures
 * (Renamed from middleware in Next.js 16)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV === 'development';

  // 1. Bot protection (early exit for blocked bots)
  const botResponse = botProtection(request);
  if (botResponse) {
    return botResponse;
  }

  // 2. Rate limiting for API and sensitive routes
  if (pathname.startsWith('/api/')) {
    let rateLimitType: 'api' | 'auth' | 'upload' | 'webhook' = 'api';

    if (pathname.includes('/auth/')) {
      rateLimitType = 'auth';
    } else if (pathname.includes('/upload')) {
      rateLimitType = 'upload';
    } else if (pathname.includes('/webhooks/')) {
      rateLimitType = 'webhook';
    }

    const rateLimitResult = await checkRateLimit(request, rateLimitType);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${resetDate.toISOString()}`,
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
  }

  // 3. Apply authentication middleware
  const authResult = await auth(request as any);
  
  let response: NextResponse;
  
  // If auth middleware returns a response, use it (redirect, etc.)
  if (authResult instanceof NextResponse) {
    response = authResult;
  } else if (shouldApplyCartMiddleware(pathname)) {
    // 4. Cart middleware (session management)
    response = cartMiddleware(request);
  } else {
    response = NextResponse.next();
    
    // Handle cart session generation
    if (!request.cookies.get('sessionCartId')) {
      const sessionCartId = crypto.randomUUID().replace(/-/g, '');
      response.cookies.set('sessionCartId', sessionCartId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
  }

  // 5. Apply security headers
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

  // 6. Additional security for sensitive routes
  if (shouldApplyEnhancedSecurity(pathname)) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

/**
 * Proxy configuration
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
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
