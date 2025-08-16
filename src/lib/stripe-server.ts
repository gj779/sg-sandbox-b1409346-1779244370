import Stripe from 'stripe';
import { logger } from './logger';

/**
 * Enhanced Stripe server configuration with environment validation and TypeScript support
 */

// Environment variable validation
function validateStripeEnvironment(): void {
  const requiredVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required Stripe environment variables: ${missingVars.join(', ')}`;
    logger.paymentError('Stripe configuration error', new Error(errorMessage));
    throw new Error(errorMessage);
  }

  // Validate key formats
  if (requiredVars.STRIPE_SECRET_KEY && !requiredVars.STRIPE_SECRET_KEY.startsWith('sk_')) {
    const errorMessage = 'STRIPE_SECRET_KEY must start with "sk_"';
    logger.paymentError('Invalid Stripe secret key format', new Error(errorMessage));
    throw new Error(errorMessage);
  }

  if (requiredVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !requiredVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    const errorMessage = 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"';
    logger.paymentError('Invalid Stripe publishable key format', new Error(errorMessage));
    throw new Error(errorMessage);
  }

  logger.paymentInfo('Stripe environment validation passed');
}

// Validate environment on module load
try {
  validateStripeEnvironment();
} catch (error) {
  logger.paymentError('Failed to initialize Stripe configuration', error);
}

// Initialize Stripe with enhanced configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  telemetry: false, // Disable telemetry for privacy
  appInfo: {
    name: 'StaffSpace',
    version: '1.0.0',
    url: 'https://staffspace.vercel.app',
  },
});

// Export configured Stripe instance
export default stripe;

// Export configuration utilities
export const stripeConfig = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  apiVersion: '2024-12-18.acacia' as const,
  
  // Validation helpers
  validateKeys(): boolean {
    try {
      validateStripeEnvironment();
      return true;
    } catch {
      return false;
    }
  },

  // Environment detection
  isTestMode(): boolean {
    return this.secretKey.includes('test') || this.publicKey.includes('test');
  },

  isLiveMode(): boolean {
    return !this.isTestMode();
  },

  // Configuration status
  getStatus(): {
    configured: boolean;
    testMode: boolean;
    keysValid: boolean;
    environment: 'test' | 'live' | 'unknown';
  } {
    const configured = this.validateKeys();
    const testMode = this.isTestMode();
    
    return {
      configured,
      testMode,
      keysValid: configured,
      environment: configured ? (testMode ? 'test' : 'live') : 'unknown',
    };
  },
};

// TypeScript type exports for enhanced development experience
export type StripeInstance = typeof stripe;
export type StripeConfig = typeof stripeConfig;

// Currency and formatting utilities
export const stripeUtils = {
  // Convert amount to Stripe's smallest currency unit (cents)
  toStripeAmount(amount: number, currency: string = 'usd'): number {
    // Most currencies use 2 decimal places, but some exceptions exist
    const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
    
    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return Math.round(amount);
    }
    
    return Math.round(amount * 100);
  },

  // Convert Stripe amount back to standard currency unit
  fromStripeAmount(amount: number, currency: string = 'usd'): number {
    const zeroDecimalCurrencies = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'];
    
    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return amount;
    }
    
    return amount / 100;
  },

  // Format currency for display
  formatCurrency(amount: number, currency: string = 'usd', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  },

  // Validate webhook signature
  validateWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      stripe.webhooks.constructEvent(payload, signature, secret);
      return true;
    } catch (error) {
      logger.paymentError('Webhook signature validation failed', error);
      return false;
    }
  },
};

// Export logging utilities for payment operations
export const stripeLogger = {
  logPaymentIntent(action: string, paymentIntentId: string, amount?: number, currency?: string): void {
    logger.paymentInfo(`Payment Intent ${action}`, {
      paymentIntentId,
      amount,
      currency,
    });
  },

  logSubscription(action: string, subscriptionId: string, customerId?: string): void {
    logger.paymentInfo(`Subscription ${action}`, {
      subscriptionId,
      customerId,
    });
  },

  logWebhook(eventType: string, eventId: string): void {
    logger.paymentInfo(`Webhook received: ${eventType}`, { eventId });
  },

  logError(operation: string, error: any): void {
    logger.paymentError(`Stripe operation failed: ${operation}`, error);
  },
};
