import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  maxRequests?: number;
};

// Rate limiting configuration
const rateLimitConfig = {
  // General API endpoints
  api: { maxRequests: 100, interval: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  // Authentication endpoints (more restrictive)
  auth: { maxRequests: 5, interval: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  // File upload endpoints
  upload: { maxRequests: 10, interval: 60 * 1000 }, // 10 uploads per minute
  // Webhook endpoints
  webhook: { maxRequests: 1000, interval: 60 * 1000 }, // 1000 requests per minute for webhooks
};

// Create rate limiter instances
const createRateLimiter = (options: Options) => {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) => {
      const tokenCount = tokenCache.get(token) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      return {
        success: !isRateLimited,
        limit,
        current: currentUsage,
        remaining: Math.max(0, limit - currentUsage),
        resetTime: Date.now() + (options.interval || 60000),
      };
    },
  };
};

// Create different rate limiters for different endpoints
export const rateLimiters = {
  api: createRateLimiter({
    uniqueTokenPerInterval: 500,
    interval: rateLimitConfig.api.interval,
  }),
  auth: createRateLimiter({
    uniqueTokenPerInterval: 300,
    interval: rateLimitConfig.auth.interval,
  }),
  upload: createRateLimiter({
    uniqueTokenPerInterval: 200,
    interval: rateLimitConfig.upload.interval,
  }),
  webhook: createRateLimiter({
    uniqueTokenPerInterval: 1000,
    interval: rateLimitConfig.webhook.interval,
  }),
};

// Helper function to get client IP
export function getClientIP(request: Request): string {
  // Try different headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback to a default (not ideal for production)
  return 'unknown';
}

// Rate limit check function
export async function checkRateLimit(
  request: Request, 
  type: keyof typeof rateLimiters = 'api'
): Promise<{
  success: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}> {
  const ip = getClientIP(request);
  const identifier = `${type}:${ip}`;
  
  const maxRequests = rateLimitConfig[type].maxRequests;
  return rateLimiters[type].check(maxRequests, identifier);
}

// Middleware wrapper for rate limiting
export function withRateLimit(type: keyof typeof rateLimiters = 'api') {
  return async (request: Request, next: () => Promise<Response>) => {
    const rateLimitResult = await checkRateLimit(request, type);
    
    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime);
      
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${resetDate.toISOString()}`,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const response = await next();
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    
    return response;
  };
}