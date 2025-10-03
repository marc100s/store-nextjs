/**
 * Performance Monitoring Utilities
 * Tracks and reports application performance metrics
 */

import { useEffect, useRef } from 'react';

// Type definitions for performance APIs
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface WindowWithGtag extends Window {
  gtag: (...args: unknown[]) => void;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

// Performance metrics type definitions
export interface PerformanceMetrics {
  FCP: number | null;  // First Contentful Paint
  LCP: number | null;  // Largest Contentful Paint
  FID: number | null;  // First Input Delay
  CLS: number | null;  // Cumulative Layout Shift
  TTFB: number | null; // Time to First Byte
  INP: number | null;  // Interaction to Next Paint
}

// Performance observer for Core Web Vitals
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    FCP: null,
    LCP: null,
    FID: null,
    CLS: null,
    TTFB: null,
    INP: null,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = Math.round(entry.startTime);
            this.reportMetric('FCP', this.metrics.FCP);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.error('Failed to observe FCP:', e);
    }

    // Observe LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.LCP = Math.round(lastEntry.startTime);
        this.reportMetric('LCP', this.metrics.LCP);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.error('Failed to observe LCP:', e);
    }

    // Observe FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          this.metrics.FID = Math.round(fidEntry.processingStart - fidEntry.startTime);
          this.reportMetric('FID', this.metrics.FID);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.error('Failed to observe FID:', e);
    }

    // Observe CLS
    try {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            clsScore += layoutShift.value;
            this.metrics.CLS = Math.round(clsScore * 1000) / 1000;
          }
        }
        this.reportMetric('CLS', this.metrics.CLS);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.error('Failed to observe CLS:', e);
    }

    // Calculate TTFB
    this.calculateTTFB();
  }

  private calculateTTFB() {
    if (typeof window !== 'undefined' && window.performance?.timing) {
      const { navigationStart, responseStart } = window.performance.timing;
      if (navigationStart && responseStart) {
        this.metrics.TTFB = responseStart - navigationStart;
        this.reportMetric('TTFB', this.metrics.TTFB);
      }
    }
  }

  private reportMetric(name: string, value: number | null) {
    if (value === null) return;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as WindowWithGtag).gtag;
        gtag('event', 'web_vitals', {
          event_category: 'Performance',
          event_label: name,
          value: Math.round(value),
          non_interaction: true,
        });
      }

      // Send to custom analytics endpoint
      this.sendToAnalytics(name, value);
    }
  }

  private sendToAnalytics(metric: string, value: number) {
    // Batch metrics and send periodically
    const data = {
      metric,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Use beacon API for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(data));
    } else {
      fetch('/api/metrics', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(console.error);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new PerformanceMonitor();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return monitorRef.current;
}

// Utility to measure async operation performance
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

// Memory leak detection utility
export function detectMemoryLeaks() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const checkMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory;
      const usedJSHeapSize = memory.usedJSHeapSize / 1048576; // Convert to MB
      const totalJSHeapSize = memory.totalJSHeapSize / 1048576;
      const jsHeapSizeLimit = memory.jsHeapSizeLimit / 1048576;

      if (usedJSHeapSize > totalJSHeapSize * 0.9) {
        console.warn(`[Memory] High memory usage detected: ${usedJSHeapSize.toFixed(2)}MB / ${totalJSHeapSize.toFixed(2)}MB`);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Memory] Heap: ${usedJSHeapSize.toFixed(2)}MB / ${jsHeapSizeLimit.toFixed(2)}MB`);
      }
    }
  };

  // Check memory every 30 seconds
  setInterval(checkMemory, 30000);
}

// Initialize performance monitoring
let performanceMonitorInstance: PerformanceMonitor | null = null;

export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined' && !performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
    
    // Start memory leak detection in development
    if (process.env.NODE_ENV === 'development') {
      detectMemoryLeaks();
    }
  }
  
  return performanceMonitorInstance;
}

// Missing import
import { useState } from 'react';