import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger";
import { logAuditEvent } from "@/services/auditService";
import { createNotification } from "@/services/notificationsService";

// Disable Next.js body parsing — Stripe needs the raw body to verify signatures
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Idempotency: Track processed events to prevent duplicate processing
const processedEvents = new Map<string, number>();
const EVENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old processed events periodically
setInterval(() => {
  const now = Date.now();
  for (const [eventId, timestamp] of processedEvents.entries()) {
    if (now - timestamp > EVENT_CACHE_TTL) {
      processedEvents.delete(eventId);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Security: Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Security: Verify webhook secret is configured
  if (!webhookSecret) {
    logger.error("Stripe webhook secret not configured");
    return res.status(500).json({ error: "Webhook not properly configured" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    logger.warn("Webhook received without signature");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    
    logger.info("Webhook signature verified", {
      eventId: event.id,
      eventType: event.type,
    });
  } catch (err: any) {
    logger.error("Webhook signature verification failed", {
      error: err.message,
    });
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Idempotency: Check if event already processed
  if (processedEvents.has(event.id)) {
    logger.info("Event already processed (idempotent)", {
      eventId: event.id,
    });
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    // Process the webhook event
    await processWebhookEvent(event);

    // Mark event as processed
    processedEvents.set(event.id, Date.now());

    // Store event in Firestore for audit trail
    await adminDb.collection("stripe_events").doc(event.id).set({
      eventId: event.id,
      type: event.type,
      processed: true,
      processedAt: new Date(),
      data: event.data.object,
    });

    logger.info("Webhook event processed successfully", {
      eventId: event.id,
      eventType: event.type,
    });

    return res.status(200).json({ received: true });
  } catch (err: any) {
    logger.error("Webhook handler error", {
      eventId: event.id,
      eventType: event.type,
      error: err.message,
      stack: err.stack,
    });

    // Store failed event for manual review
    await adminDb
      .collection("stripe_events")
      .doc(event.id)
      .set({
        eventId: event.id,
        type: event.type,
        processed: false,
        error: err.message,
        failedAt: new Date(),
        data: event.data.object,
      })
      .catch((dbErr) => {
        logger.error("Failed to store failed webhook event", {
          error: dbErr.message,
        });
      });

    return res.status(500).json({ error: "Internal server error" });
  }
}

async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    case "invoice.upcoming": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleUpcomingInvoice(invoice);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(paymentIntent);
      break;
    }

    default:
      logger.info("Unhandled webhook event type", { eventType: event.type });
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    logger.warn("Checkout session missing userId metadata", {
      sessionId: session.id,
    });
    return;
  }

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        stripeCustomerId: session.customer,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "subscription.checkout_completed",
      details: {
        sessionId: session.id,
        customerId: session.customer,
        amount: session.amount_total,
      },
      timestamp: new Date(),
    });

    // Notify user
    await createNotification({
      userId,
      type: "payment",
      title: "Subscription Activated",
      message: "Your subscription has been successfully activated. Welcome!",
      timestamp: new Date(),
      read: false,
    });

    logger.info("Checkout completed", {
      userId,
      sessionId: session.id,
      customerId: session.customer,
    });
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    logger.warn("Subscription missing userId metadata", {
      subscriptionId: subscription.id,
    });
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planName = subscription.items.data[0]?.price.nickname || "Unknown Plan";

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPriceId: priceId ?? null,
        subscriptionPlan: planName,
        subscriptionCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
        updatedAt: new Date(),
      });

    // Log to payments subcollection
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .add({
        type: "subscription_update",
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId,
        planName,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        timestamp: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "subscription.updated",
      details: {
        subscriptionId: subscription.id,
        status: subscription.status,
        plan: planName,
      },
      timestamp: new Date(),
    });

    // Notify user of important status changes
    if (
      subscription.status === "active" ||
      subscription.status === "past_due"
    ) {
      const notificationMessage =
        subscription.status === "active"
          ? "Your subscription has been updated successfully."
          : "Your subscription payment is past due. Please update your payment method.";

      await createNotification({
        userId,
        type: "payment",
        title: "Subscription Update",
        message: notificationMessage,
        timestamp: new Date(),
        read: false,
      });
    }

    logger.info("Subscription updated", {
      userId,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    logger.warn("Cancelled subscription missing userId metadata", {
      subscriptionId: subscription.id,
    });
    return;
  }

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        subscriptionStatus: "cancelled",
        subscriptionId: null,
        subscriptionCancelledAt: new Date(),
        updatedAt: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "subscription.cancelled",
      details: {
        subscriptionId: subscription.id,
        cancelledAt: new Date(subscription.canceled_at! * 1000),
      },
      timestamp: new Date(),
    });

    // Notify user
    await createNotification({
      userId,
      type: "payment",
      title: "Subscription Cancelled",
      message:
        "Your subscription has been cancelled. You'll have access until the end of your billing period.",
      timestamp: new Date(),
      read: false,
    });

    logger.info("Subscription cancelled", {
      userId,
      subscriptionId: subscription.id,
    });
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user by stripeCustomerId
  const usersSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnap.empty) {
    logger.warn("Payment succeeded for unknown customer", { customerId });
    return;
  }

  const userId = usersSnap.docs[0].id;

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .add({
        type: "payment_succeeded",
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        timestamp: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "payment.succeeded",
      details: {
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
      },
      timestamp: new Date(),
    });

    // Notify user
    await createNotification({
      userId,
      type: "payment",
      title: "Payment Successful",
      message: `Your payment of ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()} was processed successfully.`,
      timestamp: new Date(),
      read: false,
    });

    logger.info("Payment succeeded", {
      userId,
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
    });
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const usersSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnap.empty) {
    logger.warn("Payment failed for unknown customer", { customerId });
    return;
  }

  const userId = usersSnap.docs[0].id;

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        subscriptionStatus: "past_due",
        updatedAt: new Date(),
      });

    await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .add({
        type: "payment_failed",
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        timestamp: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "payment.failed",
      details: {
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
      },
      timestamp: new Date(),
    });

    // Notify user
    await createNotification({
      userId,
      type: "payment",
      title: "Payment Failed",
      message:
        "Your payment failed. Please update your payment method to avoid service interruption.",
      timestamp: new Date(),
      read: false,
      metadata: { priority: "high" },
    });

    logger.warn("Payment failed", {
      userId,
      invoiceId: invoice.id,
      amount: invoice.amount_due,
    });
  });
}

async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const usersSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnap.empty) return;

  const userId = usersSnap.docs[0].id;

  await retryOperation(async () => {
    // Notify user of upcoming charge
    await createNotification({
      userId,
      type: "payment",
      title: "Upcoming Payment",
      message: `Your subscription will renew on ${new Date(invoice.period_end * 1000).toLocaleDateString()} for ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()}.`,
      timestamp: new Date(),
      read: false,
    });

    logger.info("Upcoming invoice notification sent", {
      userId,
      invoiceId: invoice.id,
      amount: invoice.amount_due,
    });
  });
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  const customerId = paymentIntent.customer as string;
  if (!customerId) return;

  const usersSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnap.empty) return;

  const userId = usersSnap.docs[0].id;

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .add({
        type: "payment_intent_succeeded",
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        timestamp: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "payment_intent.succeeded",
      details: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      timestamp: new Date(),
    });

    logger.info("Payment intent succeeded", {
      userId,
      paymentIntentId: paymentIntent.id,
    });
  });
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const customerId = paymentIntent.customer as string;
  if (!customerId) return;

  const usersSnap = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnap.empty) return;

  const userId = usersSnap.docs[0].id;

  await retryOperation(async () => {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("payments")
      .add({
        type: "payment_intent_failed",
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        error: paymentIntent.last_payment_error?.message,
        timestamp: new Date(),
      });

    // Audit log
    await logAuditEvent({
      userId,
      action: "payment_intent.failed",
      details: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        error: paymentIntent.last_payment_error?.message,
      },
      timestamp: new Date(),
    });

    // Notify user
    await createNotification({
      userId,
      type: "payment",
      title: "Payment Failed",
      message: "Your payment could not be processed. Please try again or contact support.",
      timestamp: new Date(),
      read: false,
      metadata: { priority: "high" },
    });

    logger.warn("Payment intent failed", {
      userId,
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    });
  });
}

// Retry helper for transient failures
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      logger.warn("Operation failed, retrying", {
        attempt,
        maxRetries,
        error: error.message,
      });

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}