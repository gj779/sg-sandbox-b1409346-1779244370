/**
 * Authentication utility functions for safe operations
 */

/**
 * Safely extracts Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Check if the header starts with "Bearer "
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract the token part after "Bearer "
  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Validate token format (basic check)
  if (!token || token.length < 10) {
    return null;
  }

  return token.trim();
}

/**
 * Safely splits full name into first and last name
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName || typeof fullName !== 'string') {
    return { firstName: '', lastName: '' };
  }

  const trimmedName = fullName.trim();
  
  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  // Split by whitespace and filter empty strings
  const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);

  if (nameParts.length === 0) {
    return { firstName: '', lastName: '' };
  }

  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }

  // Take first part as firstName and join the rest as lastName
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return { firstName, lastName };
}

/**
 * Safely extracts initials from a name
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const { firstName, lastName } = splitName(name);
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`;
  }

  return firstInitial || '';
}

/**
 * Safely formats display name
 */
export function formatDisplayName(firstName: string, lastName: string): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();

  if (first && last) {
    return `${first} ${last}`;
  }

  return first || last || 'Unknown User';
}

/**
 * Validates if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Safely truncates text to specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Masks email for privacy (shows first few chars and domain)
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'hidden@email.com';
  }

  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  const maskedLocal = `${localPart.slice(0, 2)}***${localPart.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Generates a safe display name from email
 */
export function getDisplayNameFromEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'User';
  }

  const localPart = email.split('@')[0];
  
  // Remove dots and underscores, capitalize first letter
  const cleanName = localPart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return cleanName || 'User';
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Safely converts string to boolean
 */
export function stringToBoolean(value: string | boolean | undefined | null): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value !== 'string') {
    return false;
  }
  
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Creates a safe redirect URL
 */
export function createSafeRedirectUrl(url: string, fallback: string = '/'): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  // Only allow relative URLs or same-origin URLs for security
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Ensure it's same origin
    if (parsed.origin !== window.location.origin) {
      return fallback;
    }
    
    return parsed.pathname + parsed.search;
  } catch {
    // If URL parsing fails, use the fallback
    return fallback;
  }
}
