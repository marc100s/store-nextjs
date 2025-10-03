/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_FORM_FIELD = '_csrf';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(
  request: NextRequest,
  token: string | null
): boolean {
  if (!token) return false;

  // Get token from header or body
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const bodyToken = request.nextUrl.searchParams.get(CSRF_FORM_FIELD);
  
  const requestToken = headerToken || bodyToken;
  
  if (!requestToken) return false;

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(requestToken)
  );
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  const method = request.method;
  
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Get CSRF token from cookie
  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME);
  
  // Verify token for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    if (!verifyCSRFToken(request, csrfCookie?.value || null)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  }

  // Generate new token if not exists
  const response = await next();
  
  if (!csrfCookie) {
    const newToken = generateCSRFToken();
    response.cookies.set(CSRF_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    // Add token to response header for client to use
    response.headers.set('X-CSRF-Token', newToken);
  }

  return response;
}

/**
 * Get CSRF token from browser (not a React hook)
 */
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Get token from cookie
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith(CSRF_COOKIE_NAME));
  
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }
  
  // Get token from meta tag (if server-rendered)
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag?.getAttribute('content') || null;
}

/**
 * Helper to add CSRF token to fetch requests
 */
export function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getCSRFToken();
  
  if (token) {
    options.headers = {
      ...options.headers,
      [CSRF_HEADER_NAME]: token,
    };
  }
  
  return fetch(url, options);
}
