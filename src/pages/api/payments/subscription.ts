import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import stripeService from "@/services/stripeService";
import { adminDb } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET and POST methods
  if (!["GET", "POST"].includes(req.method || "")) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the user's ID from the auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if Firebase Admin is initialized
    if (!adminDb) {
      return res.status(503).json({ error: "Firebase Admin is not initialized" });
    }

    // Handle GET request - Fetch subscription details
    if (req.method === "GET") {
      // Get the user's Stripe customer ID
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data();
      const customerId = userData?.stripeCustomerId;

      if (!customerId) {
        return res.status(404).json({ error: "No subscription found" });
      }

      // Get all subscriptions for the customer
      const subscriptions = await stripeService.getSubscriptionsForCustomer(customerId);
      return res.status(200).json(subscriptions);
    }

    // Handle POST request - Create or update subscription
    if (req.method === "POST") {
      const { priceId, subscriptionId } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }

      // Get or create customer
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data();
      let customerId = userData?.stripeCustomerId;

      if (!customerId) {
        // Create a new customer in Stripe
        const customer = await stripeService.createCustomer(userData?.email || "", userData?.name);
        customerId = customer.id;

        // Link the customer to the user
        await stripeService.linkUserToCustomer(userId, customerId);
      }

      let subscription;
      if (subscriptionId) {
        // Update existing subscription
        subscription = await stripeService.updateSubscription(subscriptionId, priceId);
      } else {
        // Create new subscription
        subscription = await stripeService.createSubscription(customerId, priceId);

        // Store subscription details in Firestore
        await adminDb.collection("subscriptions").doc(subscription.id).set({
          userId,
          customerId,
          status: subscription.status,
          priceId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          createdAt: new Date(),
        });
      }

      return res.status(200).json(subscription);
    }
  } catch (error) {
    console.error("Error handling subscription:", error);
    return res.status(500).json({ error: "Failed to process subscription request" });
  }
}
