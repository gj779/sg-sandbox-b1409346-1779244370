
import stripe from "@/lib/stripe-server";
import { firestore } from "@/lib/firebase-admin";

// Types for our Stripe service
export interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  created: number;
  customer?: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: number;
  customer: string;
  items: {
    data: Array<{
      price: {
        product: string;
        unit_amount: number;
      };
    }>;
  };
}

// Service for handling Stripe operations
const stripeService = {
  // Create a payment intent for one-time payments
  async createPaymentIntent(amount: number, currency: string = "usd", customerId?: string) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return paymentIntent;
  },

  // Create a customer in Stripe
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    return customer;
  },

  // Create a subscription for a customer
  async createSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });
    
    return subscription;
  },

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription as Subscription;
  },

  // Get all subscriptions for a customer
  async getSubscriptionsForCustomer(customerId: string): Promise<Subscription[]> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.latest_invoice", "data.customer"],
    });
    
    return subscriptions.data as Subscription[];
  },

  // Update a subscription with a new price
  async updateSubscription(subscriptionId: string, newPriceId: string) {
    // Get the subscription to find the item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;

    // Update the subscription item with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: itemId,
        price: newPriceId,
      }],
    });

    return updatedSubscription;
  },

  // Cancel a subscription
  async cancelSubscription(subscriptionId: string) {
    return await stripe.subscriptions.cancel(subscriptionId);
  },

  // Get payment history for a customer
  async getPaymentHistory(customerId: string): Promise<PaymentIntent[]> {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });
    
    return paymentIntents.data as PaymentIntent[];
  },

  // Process a refund
  async createRefund(paymentIntentId: string, amount?: number) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if specified
    });
    
    return refund;
  },

  // Generate an invoice PDF link
  async getInvoicePdf(invoiceId: string) {
    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ["invoice_pdf"],
    });
    
    return invoice.invoice_pdf;
  },

  // Link a Firebase user to a Stripe customer
  async linkUserToCustomer(userId: string, customerId: string) {
    await firestore.collection("users").doc(userId).update({
      stripeCustomerId: customerId,
    });
    
    // Also store in a separate collection for easier querying
    await firestore.collection("stripe_customers").doc(customerId).set({
      userId,
      customerId,
      createdAt: new Date(),
    });
  },

  // Get Stripe customer ID for a user
  async getCustomerIdForUser(userId: string) {
    const userDoc = await firestore.collection("users").doc(userId).get();
    const userData = userDoc.data();
    
    return userData?.stripeCustomerId;
  },
};

export default stripeService;
