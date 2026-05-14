import { z } from 'zod';

// Input validation schemas
export const securitySchemas = {
  // User input validation
  userProfile: z.object({
    firstName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/),
    lastName: z.string().min(1).max(50).regex(/^[a-zA-Z\s'-]+$/),
    email: z.string().email(),
    phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
    bio: z.string().max(1000).optional()
  }),

  // Job posting validation
  jobPosting: z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(10).max(5000),
    location: z.string().min(1).max(200),
    salary: z.number().min(0).max(1000000).optional(),
    requirements: z.array(z.string().max(200)).max(10)
  }),

  // Message validation
  message: z.object({
    content: z.string().min(1).max(2000),
    recipientId: z.string().uuid()
  }),

  // File validation
  fileUpload: z.object({
    fileName: z.string().min(1).max(255),
    fileSize: z.number().min(1).max(10 * 1024 * 1024), // 10MB max
    fileType: z.enum([
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ])
  })
};

// Input sanitization service
export class SecurityService {
  private static instance: SecurityService;

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Sanitize HTML content - lightweight regex-based approach
  sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Define allowed tags
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p'];
    
    // Remove all HTML tags except allowed ones
    let sanitized = input;
    
    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove style tags and their content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove all event handlers
    sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
    
    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove data: protocol (can be used for XSS)
    sanitized = sanitized.replace(/data:/gi, '');
    
    // Remove all tags except allowed ones
    sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match.replace(/\s+[a-z\-]+\s*=\s*["'][^"']*["']/gi, '') : '';
    });
    
    return sanitized.trim();
  }

  // Sanitize text input
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate and sanitize user input
  validateInput<T>(data: unknown, schema: z.ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  // Check for SQL injection patterns
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\b.*=.*)/i,
      /(--|\/\*|\*\/)/,
      /(\b(EXEC|EXECUTE)\b)/i,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive input validation
  validateAndSanitize(input: string, type: 'text' | 'html' | 'email' | 'phone' = 'text'): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }

    // Check for malicious patterns
    if (this.detectSQLInjection(input)) {
      throw new Error('Invalid input: potential SQL injection detected');
    }

    if (this.detectXSS(input)) {
      throw new Error('Invalid input: potential XSS detected');
    }

    // Sanitize based on type
    switch (type) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          throw new Error('Invalid email format');
        }
        return input.toLowerCase().trim();
      case 'phone':
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(input)) {
          throw new Error('Invalid phone format');
        }
        return input.replace(/[^\d+]/g, '');
      default:
        return this.sanitizeText(input);
    }
  }

  // Generate secure file name
  generateSecureFileName(originalName: string): string {
    const extension = originalName.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}.${extension}`;
  }

  // Validate file upload security
  validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }): { isValid: boolean; error?: string } {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.jar'];
    const hasSuspicious = suspiciousExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (hasSuspicious) {
      return { isValid: false, error: 'File type not allowed for security reasons' };
    }

    return { isValid: true };
  }

  // Log security events
  logSecurityEvent(event: {
    type: 'login_attempt' | 'invalid_input' | 'file_upload' | 'data_access' | 'permission_denied';
    userId?: string;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    userAgent?: string;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };

    // In production, this would send to a secure logging service
    console.log('Security Event:', logEntry);
    
    // Store in localStorage for demo (in production, use secure logging service)
    if (typeof window !== 'undefined') {
      const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('securityLogs', JSON.stringify(existingLogs));
    }
  }

  // Rate limiting check (simple client-side implementation)
  checkRateLimit(action: string, maxRequests: number = 5, timeWindow: number = 60000): boolean {
    if (typeof window === 'undefined') {
      return true; // Skip rate limiting on server-side
    }
    
    const key = `rateLimit_${action}`;
    const now = Date.now();
    
    const attempts = JSON.parse(localStorage.getItem(key) || '[]')
      .filter((timestamp: number) => now - timestamp < timeWindow);
    
    if (attempts.length >= maxRequests) {
      this.logSecurityEvent({
        type: 'invalid_input',
        details: `Rate limit exceeded for action: ${action}`,
        severity: 'medium'
      });
      return false;
    }
    
    attempts.push(now);
    localStorage.setItem(key, JSON.stringify(attempts));
    return true;
  }

  // Password strength validation
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password should contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password should contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password should contain numbers');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password should contain special characters');
    } else {
      score += 1;
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      feedback.push('Password is too common');
      score = Math.max(0, score - 2);
    }

    return {
      isValid: score >= 4 && feedback.length === 0,
      score,
      feedback
    };
  }
}

export const securityService = SecurityService.getInstance();