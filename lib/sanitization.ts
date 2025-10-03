/**
 * Input Sanitization and Validation Utilities
 * Provides comprehensive input sanitization to prevent XSS, SQL injection, and other attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side sanitization
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }
  
  // Client-side sanitization
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize user input for display (escapes HTML entities)
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  // Remove any HTML tags and trim whitespace
  const cleaned = email.replace(/<[^>]*>/g, '').trim().toLowerCase();
  
  // Validate email format
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }
  
  return cleaned;
}

/**
 * Sanitize URLs to prevent javascript: and data: attacks
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsed.toString();
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    
    throw new Error('Invalid URL');
  }
}

/**
 * Sanitize file names to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove any path separators and null bytes
  let sanitized = fileName
    .replace(/[\/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/\.{2,}/g, '.');
  
  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit filename length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 250 - extension.length) + '.' + extension;
  }
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '.') {
    throw new Error('Invalid file name');
  }
  
  return sanitized;
}

/**
 * Sanitize phone numbers
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except + at the beginning
  let sanitized = phone.replace(/[^\d+]/g, '');
  
  // Ensure + is only at the beginning
  if (sanitized.includes('+') && !sanitized.startsWith('+')) {
    sanitized = sanitized.replace(/\+/g, '');
  }
  
  // Validate length (minimum 10 digits, maximum 15 for international)
  const digitsOnly = sanitized.replace(/\+/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    throw new Error('Invalid phone number length');
  }
  
  return sanitized;
}

/**
 * Sanitize and validate credit card numbers (for display only)
 */
export function sanitizeCreditCard(cardNumber: string): string {
  // Remove all non-digit characters
  const sanitized = cardNumber.replace(/\D/g, '');
  
  // Validate length (13-19 digits for major card types)
  if (sanitized.length < 13 || sanitized.length > 19) {
    throw new Error('Invalid credit card number length');
  }
  
  // Mask all but last 4 digits for security
  return '*'.repeat(sanitized.length - 4) + sanitized.slice(-4);
}

/**
 * Sanitize SQL input to prevent SQL injection
 * Note: Always use parameterized queries instead of this for actual SQL operations
 */
export function sanitizeForSQL(input: string): string {
  // This is a basic sanitization - always prefer parameterized queries
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
    .replace(/(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript)/gi, '');
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON(jsonString: string): object | null {
  try {
    // Parse and re-stringify to remove any non-JSON content
    const parsed = JSON.parse(jsonString);
    
    // Recursively sanitize string values
    const sanitizeObject = (obj: unknown): unknown => {
      if (typeof obj === 'string') {
        return escapeHTML(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          // Sanitize keys to prevent prototype pollution
          if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
            sanitized[escapeHTML(key)] = sanitizeObject(value);
          }
        }
        return sanitized;
      }
      return obj;
    };
    
    return sanitizeObject(parsed);
  } catch {
    return null;
  }
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number,
  options: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    decimalPlaces?: number;
  } = {}
): number {
  let num: number;
  
  if (typeof input === 'string') {
    // Remove any non-numeric characters except . and -
    const cleaned = input.replace(/[^0-9.-]/g, '');
    num = parseFloat(cleaned);
  } else {
    num = input;
  }
  
  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Invalid number');
  }
  
  // Apply constraints
  if (options.min !== undefined && num < options.min) {
    throw new Error(`Number must be at least ${options.min}`);
  }
  
  if (options.max !== undefined && num > options.max) {
    throw new Error(`Number must be at most ${options.max}`);
  }
  
  if (!options.allowDecimals) {
    num = Math.floor(num);
  } else if (options.decimalPlaces !== undefined) {
    num = Math.round(num * Math.pow(10, options.decimalPlaces)) / Math.pow(10, options.decimalPlaces);
  }
  
  return num;
}

/**
 * Sanitize search queries
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that might be used for injection
  let sanitized = query
    .replace(/[<>'"]/g, '')
    .replace(/script/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
  
  // Limit query length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  return sanitized;
}

/**
 * Create a sanitization middleware for API routes
 */
interface RequestWithBody {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
}

interface ResponseWithStatus {
  status: (code: number) => { json: (data: unknown) => void };
}

type NextFunction = () => void;

export function createSanitizationMiddleware(
  rules: Record<string, (value: unknown) => unknown>
) {
  return (req: RequestWithBody, res: ResponseWithStatus, next: NextFunction) => {
    try {
      // Sanitize body
      if (req.body) {
        for (const [key, sanitizer] of Object.entries(rules)) {
          if (req.body[key] !== undefined) {
            req.body[key] = sanitizer(req.body[key]);
          }
        }
      }
      
      // Sanitize query parameters
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            req.query[key] = escapeHTML(value);
          }
        }
      }
      
      next();
    } catch {
      res.status(400).json({ error: 'Invalid input' });
    }
  };
}

/**
 * Batch sanitization for objects
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  rules: Partial<Record<keyof T, (value: unknown) => unknown>>
): T {
  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(sanitized)) {
    const sanitizer = rules[key as keyof T];
    if (sanitizer && value !== undefined && value !== null) {
      (sanitized as Record<string, unknown>)[key] = sanitizer(value);
    } else if (typeof value === 'string') {
      // Default string sanitization
      (sanitized as Record<string, unknown>)[key] = escapeHTML(value);
    }
  }
  
  return sanitized;
}