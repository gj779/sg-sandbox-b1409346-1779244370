
import { NextApiRequest, NextApiResponse } from 'next';
import { securityService } from '@/lib/security';
import { auditService } from '@/services/auditService';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

export interface SecureApiRequest extends NextApiRequest {
  user?: {
    uid: string;
    email: string;
    userType: string;
  };
  clientInfo?: {
    ipAddress: string;
    userAgent: string;
  };
}

// Rate limiting middleware
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: SecureApiRequest, res: NextApiResponse) => {
      const clientKey = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      
      const rateLimit = rateLimitStore.get(clientKey as string);
      
      if (rateLimit && now < rateLimit.resetTime) {
        if (rateLimit.count >= maxRequests) {
          // Log rate limit exceeded
          if (req.user) {
            await auditService.logSecurityEvent(
              req.user.uid,
              'rate_limit_exceeded',
              {
                endpoint: req.url,
                method: req.method,
                ipAddress: clientKey,
                userAgent: req.headers['user-agent']
              },
              'warning'
            );
          }
          
          return res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.'
          });
        }
        rateLimit.count++;
      } else {
        rateLimitStore.set(clientKey as string, {
          count: 1,
          resetTime: now + windowMs
        });
      }
      
      return handler(req, res);
    };
  };
}

// Input validation middleware
export function withInputValidation() {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: SecureApiRequest, res: NextApiResponse) => {
      try {
        // Validate and sanitize all string inputs in body
        if (req.body && typeof req.body === 'object') {
          req.body = sanitizeObject(req.body);
        }
        
        // Validate and sanitize query parameters
        if (req.query && typeof req.query === 'object') {
          req.query = sanitizeObject(req.query);
        }
        
        return handler(req, res);
      } catch (error) {
        console.error('Input validation error:', error);
        
        if (req.user) {
          await auditService.logSecurityEvent(
            req.user.uid,
            'invalid_input_detected',
            {
              endpoint: req.url,
              method: req.method,
              error: error instanceof Error ? error.message : 'Unknown validation error'
            },
            'warning'
          );
        }
        
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Request contains invalid or potentially malicious content'
        });
      }
    };
  };
}

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return securityService.validateAndSanitize(obj, 'text');
  } else if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

// Security headers middleware
export function withSecurityHeaders() {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: SecureApiRequest, res: NextApiResponse) => {
      // Set security headers (excluding frame-related headers for preview compatibility)
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      
      // Only set HTTPS headers in production
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      
      return handler(req, res);
    };
  };
}

// Client info extraction middleware
export function withClientInfo() {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: SecureApiRequest, res: NextApiResponse) => {
      req.clientInfo = {
        ipAddress: (req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown') as string,
        userAgent: req.headers['user-agent'] || 'unknown'
      };
      
      return handler(req, res);
    };
  };
}

// CSRF protection middleware
export function withCSRFProtection() {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: SecureApiRequest, res: NextApiResponse) => {
      // Skip CSRF for GET requests
      if (req.method === 'GET') {
        return handler(req, res);
      }
      
      const origin = req.headers.origin;
      const host = req.headers.host;
      
      // Validate origin matches host in production
      if (process.env.NODE_ENV === 'production' && origin) {
        const allowedOrigins = [
          `https://${host}`,
          process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null
        ].filter(Boolean);
        
        if (!allowedOrigins.some(allowed => origin.startsWith(allowed as string))) {
          console.warn('CSRF: Origin mismatch', { origin, host });
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid origin'
          });
        }
      }
      
      return handler(req, res);
    };
  };
}

// Combine all security middleware
export function withSecurity(options?: {
  rateLimit?: { maxRequests: number; windowMs: number };
  skipInputValidation?: boolean;
  skipCSRF?: boolean;
}) {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    let securedHandler = handler;
    
    // Apply security layers in reverse order
    if (!options?.skipCSRF) {
      securedHandler = withCSRFProtection()(securedHandler);
    }
    
    securedHandler = withClientInfo()(securedHandler);
    securedHandler = withSecurityHeaders()(securedHandler);
    
    if (!options?.skipInputValidation) {
      securedHandler = withInputValidation()(securedHandler);
    }
    
    if (options?.rateLimit) {
      securedHandler = withRateLimit(
        options.rateLimit.maxRequests,
        options.rateLimit.windowMs
      )(securedHandler);
    }
    
    return securedHandler;
  };
}

// Security audit middleware
export function withAuditLog(action: string, resource: string) {
  return (handler: (req: SecureApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: SecureApiRequest, res: NextApiResponse) => {
      const startTime = Date.now();
      
      try {
        await handler(req, res);
        
        // Log successful API access
        if (req.user) {
          await auditService.logDataAccess(
            req.user.uid,
            action as any,
            resource,
            req.query.id as string,
            true,
            {
              method: req.method,
              endpoint: req.url,
              duration: Date.now() - startTime,
              statusCode: res.statusCode,
              ipAddress: req.clientInfo?.ipAddress,
              userAgent: req.clientInfo?.userAgent
            }
          );
        }
      } catch (error) {
        // Log failed API access
        if (req.user) {
          await auditService.logDataAccess(
            req.user.uid,
            action as any,
            resource,
            req.query.id as string,
            false,
            {
              method: req.method,
              endpoint: req.url,
              duration: Date.now() - startTime,
              error: error instanceof Error ? error.message : 'Unknown error',
              ipAddress: req.clientInfo?.ipAddress,
              userAgent: req.clientInfo?.userAgent
            }
          );
        }
        
        throw error;
      }
    };
  };
}
