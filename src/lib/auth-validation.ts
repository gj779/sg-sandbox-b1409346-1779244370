import { securityService } from './security';
import { UserRole } from '@/types';

// Standardized authentication error messages
export const AUTH_ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  PASSWORDS_MISMATCH: 'Passwords do not match.',
  MISSING_FIELDS: 'Please fill in all required fields.',
  INVALID_NAME: 'Name must be at least 2 characters long and contain only letters.',
  INVALID_USER_TYPE: 'Please select a valid user type.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please check your credentials.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before signing in.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export interface SignupValidationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserRole;
}

export interface SigninValidationData {
  email: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Validates complete signup data with comprehensive security checks
 */
export function validateSignupData(data: SignupValidationData): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Partial<SignupValidationData> = {};

  // Check for required fields
  if (!data.email || !data.password || !data.confirmPassword || !data.firstName || !data.lastName) {
    errors.push(AUTH_ERROR_MESSAGES.MISSING_FIELDS);
    return { isValid: false, errors };
  }

  // Validate and sanitize email
  try {
    const sanitizedEmail = securityService.validateAndSanitize(data.email, 'email');
    sanitizedData.email = sanitizedEmail;
  } catch (error) {
    errors.push(AUTH_ERROR_MESSAGES.INVALID_EMAIL);
  }

  // Validate password strength
  const passwordValidation = securityService.validatePasswordStrength(data.password);
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.feedback.join('. ') + '.');
  }

  // Check password confirmation
  if (data.password !== data.confirmPassword) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORDS_MISMATCH);
  }

  // Validate names
  try {
    const sanitizedFirstName = securityService.validateAndSanitize(data.firstName, 'name');
    const sanitizedLastName = securityService.validateAndSanitize(data.lastName, 'name');
    
    if (sanitizedFirstName.length < 2 || sanitizedLastName.length < 2) {
      errors.push(AUTH_ERROR_MESSAGES.INVALID_NAME);
    } else {
      sanitizedData.firstName = sanitizedFirstName;
      sanitizedData.lastName = sanitizedLastName;
    }
  } catch (error) {
    errors.push(AUTH_ERROR_MESSAGES.INVALID_NAME);
  }

  // Validate user type
  if (!Object.values(UserRole).includes(data.userType)) {
    errors.push(AUTH_ERROR_MESSAGES.INVALID_USER_TYPE);
  } else {
    sanitizedData.userType = data.userType;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

/**
 * Validates sign-in data with security checks
 */
export function validateSigninData(data: SigninValidationData): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Partial<SigninValidationData> = {};

  // Check for required fields
  if (!data.email || !data.password) {
    errors.push(AUTH_ERROR_MESSAGES.MISSING_FIELDS);
    return { isValid: false, errors };
  }

  // Validate and sanitize email
  try {
    const sanitizedEmail = securityService.validateAndSanitize(data.email, 'email');
    sanitizedData.email = sanitizedEmail;
  } catch (error) {
    errors.push(AUTH_ERROR_MESSAGES.INVALID_EMAIL);
  }

  // Basic password length check (don't reveal strength requirements for sign-in)
  if (data.password.length < 6) {
    errors.push(AUTH_ERROR_MESSAGES.INVALID_PASSWORD);
  } else {
    sanitizedData.password = data.password;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

/**
 * Converts Firebase auth error codes to user-friendly messages
 */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return AUTH_ERROR_MESSAGES.AUTHENTICATION_FAILED;
    
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    
    case 'auth/invalid-email':
      return AUTH_ERROR_MESSAGES.INVALID_EMAIL;
    
    case 'auth/weak-password':
      return AUTH_ERROR_MESSAGES.WEAK_PASSWORD;
    
    case 'auth/user-disabled':
      return AUTH_ERROR_MESSAGES.ACCOUNT_DISABLED;
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    case 'auth/network-request-failed':
      return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
    
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please try again.';
    
    case 'auth/invalid-verification-id':
      return 'Invalid verification ID. Please restart the verification process.';
    
    case 'auth/code-expired':
      return 'Verification code has expired. Please request a new one.';
    
    case 'auth/missing-verification-code':
      return 'Please enter the verification code.';
    
    case 'auth/missing-verification-id':
      return 'Missing verification ID. Please restart the verification process.';
    
    case 'auth/invalid-phone-number':
      return 'Please enter a valid phone number.';
    
    case 'auth/missing-phone-number':
      return 'Please enter a phone number.';
    
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later.';
    
    default:
      return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Validates email format only (lightweight validation)
 */
export function isValidEmail(email: string): boolean {
  try {
    securityService.validateAndSanitize(email, 'email');
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates password strength only
 */
export function isStrongPassword(password: string): { isValid: boolean; feedback: string[] } {
  return securityService.validatePasswordStrength(password);
}

/**
 * Sanitizes user input safely
 */
export function sanitizeInput(input: string, type: 'email' | 'name' | 'text' = 'text'): string {
  try {
    return securityService.validateAndSanitize(input, type);
  } catch (error) {
    throw new Error(`Invalid ${type} format`);
  }
}
