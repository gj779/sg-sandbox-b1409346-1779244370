
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import stripeService from "@/services/stripeService";
import admin, { firestore } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let customerId: string | undefined;
    let limit = 10;
    
    // Parse limit from query params
    if (req.query.limit && typeof req.query.limit === "string") {
      limit = parseInt(req.query.limit, 10);
      if (isNaN(limit) || limit < 1) {
        limit = 10;
      } else if (limit > 100) {
        limit = 100; // Cap at 100 for performance
      }
    }
    
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

    // Fetch payment history from Stripe
    const payments = await stripeService.getPaymentHistory(customerId);
    
    // Limit the number of payments returned
    const limitedPayments = payments.slice(0, limit);
    
    return res.status(200).json({ 
      payments: limitedPayments,
      total: payments.length,
      limit
    });
  } catch (error: any) {
    console.error("Payment history API error:", error);
    return res.status(500).json({ 
      error: "An error occurred while processing your request",
      message: error.message
    });
  }
}
