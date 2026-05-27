import Stripe from 'stripe';
import { logger } from './logger';
import { env } from '@/env';

/**
 * Enhanced Stripe server configuration with environment validation and TypeScript support
 * Note: Environment validation is handled by src/env.ts at build time
 */

// Initialize Stripe with enhanced configuration
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  telemetry: false, // Disable telemetry for privacy
  appInfo: {
    name: 'StaffSpace',
    version: '1.0.0',
    url: env.NEXT_PUBLIC_APP_URL,
  },
});

// Export configured Stripe instance
export default stripe;

// Export configuration utilities
export const stripeConfig = {
  publicKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: env.STRIPE_SECRET_KEY,
  apiVersion: '2025-02-24.acacia' as const,
  
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
    const testMode = this.isTestMode();
    
    return {
      configured: true, // env.ts validates at build time
      testMode,
      keysValid: true, // env.ts validates at build time
      environment: testMode ? 'test' : 'live',
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