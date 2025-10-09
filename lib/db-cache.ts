/**
 * Database Query Caching and Optimization Utilities
 * Implements query result caching and database performance optimizations
 */

import { LRUCache } from "lru-cache";
import { prisma } from "@/db/prisma";
import crypto from "crypto";

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL
const MAX_CACHE_SIZE = 100; // Maximum number of cached items

// Create LRU cache instance
const queryCache = new LRUCache<string, any>({
  max: MAX_CACHE_SIZE,
  ttl: CACHE_TTL,
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

/**
 * Generate cache key from query parameters
 */
function generateCacheKey(queryName: string, params: unknown): string {
  const paramObj =
    typeof params === "object" && params !== null ? (params as object) : {};
  const sortedParams = JSON.stringify(paramObj, Object.keys(paramObj).sort());
  const hash = crypto
    .createHash("sha256")
    .update(`${queryName}:${sortedParams}`)
    .digest("hex");
  return hash;
}

/**
 * Cache wrapper for database queries
 */
export async function cachedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number;
    params?: unknown;
    invalidateOn?: string[];
    skipCache?: boolean;
  } = {}
): Promise<T> {
  // Skip cache if requested or in development
  if (options.skipCache || process.env.NODE_ENV === "development") {
    return queryFn();
  }

  const cacheKey = generateCacheKey(queryName, options.params || {});

  // Check cache
  const cached = queryCache.get(cacheKey);
  if (cached !== undefined) {
    console.log(`[Cache] Hit: ${queryName}`);
    return cached as T;
  }

  // Execute query
  console.log(`[Cache] Miss: ${queryName}`);
  const result = await queryFn();

  // Store in cache
  queryCache.set(cacheKey, result, { ttl: options.ttl || CACHE_TTL });

  return result;
}

/**
 * Invalidate cache entries
 */
export function invalidateCache(patterns: string[]): void {
  const keys = Array.from(queryCache.keys());
  let invalidated = 0;

  for (const pattern of patterns) {
    for (const key of keys) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
        invalidated++;
      }
    }
  }

  console.log(`[Cache] Invalidated ${invalidated} entries`);
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  queryCache.clear();
  console.log("[Cache] Cleared all entries");
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: queryCache.size,
    maxSize: queryCache.max,
    calculatedSize: queryCache.calculatedSize,
  };
}

/**
 * Optimized batch query execution
 */
export async function batchQuery<T, U>(
  items: U[],
  batchSize: number,
  queryFn: (batch: U[]) => Promise<T[]>
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await queryFn(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Database connection health check
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      isHealthy: true,
      latency,
    };
  } catch (error) {
    return {
      isHealthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Query performance monitor
 */
export class QueryPerformanceMonitor {
  private metrics: Map<
    string,
    {
      count: number;
      totalTime: number;
      avgTime: number;
      maxTime: number;
      minTime: number;
    }
  > = new Map();

  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - start;

      this.recordMetric(queryName, duration);

      if (duration > 1000) {
        console.warn(
          `[Performance] Slow query detected: ${queryName} took ${duration}ms`
        );
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(queryName, duration);
      throw error;
    }
  }

  private recordMetric(queryName: string, duration: number): void {
    const existing = this.metrics.get(queryName) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Infinity,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.minTime = Math.min(existing.minTime, duration);

    this.metrics.set(queryName, existing);
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  reset(): void {
    this.metrics.clear();
  }
}

// Global query monitor instance
export const queryMonitor = new QueryPerformanceMonitor();

/**
 * Optimized pagination helper
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface PrismaModel {
  count: (args: { where: Record<string, unknown> }) => Promise<number>;
  findMany: (args: {
    where: Record<string, unknown>;
    skip: number;
    take: number;
    orderBy?: Record<string, string>;
  }) => Promise<unknown[]>;
}

export async function paginate<T>(
  model: PrismaModel,
  options: PaginationOptions,
  where: Record<string, unknown> = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page);
  const limit = Math.min(100, Math.max(1, options.limit));
  const skip = (page - 1) * limit;

  // Execute count and data queries in parallel
  const [total, data] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.sortBy
        ? { [options.sortBy]: options.sortOrder || "asc" }
        : undefined,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Database transaction wrapper with retry logic
 */
interface RetryableError {
  code?: string;
  message?: string;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: RetryableError) => boolean;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  const shouldRetry =
    options.shouldRetry ||
    ((error) => {
      // Retry on connection errors or deadlocks
      return error.code === "P1001" || error.code === "P1008";
    });

  let lastError: Error | RetryableError = new Error(
    "Max retries reached and no error was thrown"
  );

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error | RetryableError;

      if (i < maxRetries - 1 && shouldRetry(error as RetryableError)) {
        console.log(`[DB] Retry attempt ${i + 1} after ${retryDelay}ms`);
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (i + 1))
        );
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Database index recommendations
 */
export const INDEX_RECOMMENDATIONS = `
-- Recommended indexes for optimal performance

-- Products table
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Orders table
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_method ON orders(payment_method);

-- OrderItems table
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Reviews table
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Cart table
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_session_cart_id ON cart(session_cart_id);

-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Composite indexes for common queries
CREATE INDEX idx_products_category_price ON products(category, price);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);
`;

/**
 * Export cache middleware for Next.js API routes
 */
interface ApiRequest {
  method?: string;
  url?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
  statusCode?: number;
  headers: {
    set: (key: string, value: string) => void;
  };
}

export function withCache(
  handler: (req: ApiRequest, res: ApiResponse) => Promise<void>,
  options: { ttl?: number; key?: string } = {}
) {
  return async (req: ApiRequest, res: ApiResponse) => {
    const cacheKey = options.key || `${req.method}:${req.url}`;

    // Check cache for GET requests
    if (req.method === "GET") {
      const cached = queryCache.get(cacheKey);
      if (cached) {
        console.log(`[API Cache] Hit: ${cacheKey}`);
        return res.status(200).json(cached);
      }
    }

    // Wrap original handler
    const originalJson = res.json;
    res.json = function (data: unknown) {
      // Cache successful responses
      if (res.statusCode === 200 && req.method === "GET") {
        queryCache.set(cacheKey, data, { ttl: options.ttl || CACHE_TTL });
      }
      return originalJson.call(this, data);
    };

    return handler(req, res);
  };
}
