import { LRUCache } from "lru-cache";

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

// Redis interface for production use
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
}

// Mock Redis client for development (falls back to memory)
class MemoryRedisClient implements RedisClient {
  private cache = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(
    key: string,
    value: string,
    options?: { EX?: number }
  ): Promise<void> {
    const expiry = options?.EX
      ? Date.now() + options.EX * 1000
      : Date.now() + 60000;
    this.cache.set(key, { value, expiry });
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const newValue = (parseInt(current || "0") + 1).toString();
    await this.set(key, newValue, { EX: 60 }); // Default 1 minute expiry
    return parseInt(newValue);
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiry = Date.now() + seconds * 1000;
    }
  }
}

// Initialize Redis client (use real Redis in production)
const redis: RedisClient = process.env.REDIS_URL
  ? (() => {
      try {
        // In production, you would initialize actual Redis client here
        // const Redis = require('ioredis');
        // return new Redis(process.env.REDIS_URL);
        console.warn(
          "Redis URL provided but Redis client not implemented. Using memory fallback."
        );
        return new MemoryRedisClient();
      } catch (error) {
        console.warn(
          "Redis connection failed, falling back to memory cache:",
          error
        );
        return new MemoryRedisClient();
      }
    })()
  : new MemoryRedisClient();

// Create rate limiter with Redis support
const createRateLimiter = (options: Options) => {
  // Fallback to LRU cache if Redis is not available
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: async (limit: number, token: string) => {
      // Try Redis first (if available), fall back to memory cache
      const redisKey = `rate_limit:${token}`;

      try {
        // Use Redis for production scalability
        if (process.env.REDIS_URL && redis) {
          const current = await redis.incr(redisKey);

          if (current === 1) {
            // Set expiry on first request
            await redis.expire(
              redisKey,
              Math.floor((options.interval || 60000) / 1000)
            );
          }

          const isRateLimited = current > limit; // Fixed: was >= now >
          const resetTime = Date.now() + (options.interval || 60000);

          return {
            success: !isRateLimited,
            limit,
            current,
            remaining: Math.max(0, limit - current),
            resetTime,
          };
        }
      } catch (error) {
        console.warn(
          "Redis rate limiting failed, falling back to memory:",
          error
        );
      }

      // Fallback to memory-based rate limiting
      const tokenCount = tokenCache.get(token) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit; // Fixed: was >= now >

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

// Helper function to get client IP with better extraction
export function getClientIP(request: Request): string {
  // List of headers to check in order of preference
  const ipHeaders = [
    "cf-connecting-ip", // Cloudflare
    "x-real-ip", // Nginx
    "x-forwarded-for", // Most proxies
    "x-client-ip", // Some proxies
    "x-cluster-client-ip", // Some clusters
    "forwarded", // RFC 7239
  ];

  for (const header of ipHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // Handle comma-separated IPs (take first one)
      const ip = value.split(",")[0].trim();

      // Basic IP validation
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Enhanced fallback strategy
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";

  // Create a more unique fallback identifier
  const fallbackId = `fallback:${hashString(userAgent + acceptLanguage)}`;

  return fallbackId;
}

// Basic IP validation helper
function isValidIP(ip: string): boolean {
  // Simple regex for IPv4 and basic IPv6 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    // Additional IPv4 validation
    const parts = ip.split(".");
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Regex.test(ip) || ip.includes("::"); // Basic IPv6 check
}

// Simple string hash for fallback identifiers
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Rate limit check function
export async function checkRateLimit(
  request: Request,
  type: keyof typeof rateLimiters = "api"
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
  return await rateLimiters[type].check(maxRequests, identifier);
}

// Middleware wrapper for rate limiting
export function withRateLimit(type: keyof typeof rateLimiters = "api") {
  return async (request: Request, next: () => Promise<Response>) => {
    const rateLimitResult = await checkRateLimit(request, type);

    if (!rateLimitResult.success) {
      const resetDate = new Date(rateLimitResult.resetTime);

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Too many requests. Try again after ${resetDate.toISOString()}`,
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
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

    // Add rate limit headers to successful responses
    const response = await next();
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      rateLimitResult.resetTime.toString()
    );

    return response;
  };
}
