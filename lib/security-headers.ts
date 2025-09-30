import { NextResponse } from 'next/server';

// Content Security Policy configuration
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.paypal.com *.uploadthing.com https://vercel.live;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  media-src 'self' https:;
  connect-src 'self' *.stripe.com *.paypal.com *.uploadthing.com https://api.resend.com wss://ws.pusher.com;
  frame-src 'self' *.stripe.com *.paypal.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' *.stripe.com *.paypal.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': ContentSecurityPolicy,
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=()',
  
  // X-Content-Type-Options
  'X-Content-Type-Options': 'nosniff',
  
  // X-Frame-Options (defense in depth with CSP frame-ancestors)
  'X-Frame-Options': 'DENY',
  
  // X-XSS-Protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',
  
  // Strict-Transport-Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // X-DNS-Prefetch-Control
  'X-DNS-Prefetch-Control': 'off',
  
  // Cross-Origin-Embedder-Policy
  'Cross-Origin-Embedder-Policy': 'credentialless',
  
  // Cross-Origin-Opener-Policy
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Cross-Origin-Resource-Policy
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // Server header hiding
  'Server': 'Prostore',
  
  // Powered by header removal (handled by Next.js config)
  'X-Powered-By': '',
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    } else {
      // Remove header if value is empty
      response.headers.delete(key);
    }
  });
  
  return response;
}

// Create security headers for API responses
export function createSecureResponse(
  data: unknown, 
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  const response = NextResponse.json(data, {
    status: options.status || 200,
    headers: options.headers,
  });
  
  return applySecurityHeaders(response);
}

// Security headers for development vs production
export function getEnvironmentSpecificHeaders(isDev: boolean, pathname?: string) {
  const headers: Record<string, string> = { ...securityHeaders };
  
  // Special handling for Stripe payment pages
  if (pathname && pathname.includes('/stripe-payment')) {
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=(self "https://*.stripe.com"), usb=(), bluetooth=()';
    headers['X-Frame-Options'] = 'SAMEORIGIN'; // Allow Stripe iframes
  }
  
  if (isDev) {
    // Relax CSP for development
    headers['Content-Security-Policy'] = headers['Content-Security-Policy']
      .replace("'unsafe-eval'", "'unsafe-eval'")
      .replace("'unsafe-inline'", "'unsafe-inline'");
    
    // Allow payment API in development
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=*, usb=(), bluetooth=()';
    
    // Remove HSTS in development
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { 'Strict-Transport-Security': _, ...devHeaders } = headers;
    return devHeaders;
  }
  
  return headers;
}
