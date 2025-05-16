
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import stripeService from "@/services/stripeService";
import { firestore } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET and POST methods
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let customerId: string | undefined;
    
    // Check if customerId is provided in query params (for admin use)
    if (req.query.customerId && typeof req.query.customerId === "string") {
      customerId = req.query.customerId;
    } else {
      // Get user from Firebase Auth
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        
        // Get customer ID from user record
        const userDoc = await firestore.collection("users").doc(userId).get();
        const userData = userDoc.data();
        
        if (!userData || !userData.stripeCustomerId) {
          return res.status(404).json({ error: "No Stripe customer found for this user" });
        }
        
        customerId = userData.stripeCustomerId;
      } catch (error) {
        return res.status(401).json({ error: "Invalid authentication token" });
      }
    }

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // GET: Fetch subscription details
    if (req.method === "GET") {
      // Get customer's subscriptions from Stripe
      const subscriptions = await stripeService.getSubscriptionsForCustomer(customerId);
      
      // Return the active subscription if any
      const activeSubscription = subscriptions.find(sub => 
        sub.status === "active" || sub.status === "trialing"
      );
      
      return res.status(200).json({ 
        subscription: activeSubscription || null,
        allSubscriptions: subscriptions 
      });
    }
    
    // POST: Create or update subscription
    if (req.method === "POST") {
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }
      
      // Check if customer already has an active subscription
      const subscriptions = await stripeService.getSubscriptionsForCustomer(customerId);
      const activeSubscription = subscriptions.find(sub => 
        sub.status === "active" || sub.status === "trialing"
      );
      
      let subscription;
      
      if (activeSubscription) {
        // Update existing subscription
        subscription = await stripeService.updateSubscription(
          activeSubscription.id,
          priceId
        );
      } else {
        // Create new subscription
        subscription = await stripeService.createSubscription(
          customerId,
          priceId
        );
      }
      
      return res.status(200).json({ subscription });
    }
  } catch (error: any) {
    console.error("Subscription API error:", error);
    return res.status(500).json({ 
      error: "An error occurred while processing your request",
      message: error.message
    });
  }
}
