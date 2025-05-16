
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const results = {
    publishableKeySet: false,
    publishableKeyValid: false,
    publishableKeyError: null as string | null,
    secretKeySet: false,
    secretKeyValid: false,
    secretKeyError: null as string | null,
  };

  // Check if publishable key is set
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  results.publishableKeySet = !!publishableKey && publishableKey.length > 0;

  // Check if secret key is set
  const secretKey = process.env.STRIPE_SECRET_KEY;
  results.secretKeySet = !!secretKey && secretKey.length > 0;

  // Validate publishable key format (basic check)
  if (results.publishableKeySet) {
    if (!publishableKey?.startsWith("pk_")) {
      results.publishableKeyError = "Invalid format. Publishable key should start with 'pk_'";
    } else {
      results.publishableKeyValid = true;
    }
  } else {
    results.publishableKeyError = "Publishable key is not set";
  }

  // Validate secret key by attempting to use it
  if (results.secretKeySet) {
    try {
      const stripe = new Stripe(secretKey as string, {
        apiVersion: "2023-10-16",
      });
      
      // Make a simple API call to verify the key works
      await stripe.balance.retrieve();
      
      results.secretKeyValid = true;
    } catch (error: any) {
      results.secretKeyValid = false;
      results.secretKeyError = error.message || "Invalid secret key";
    }
  } else {
    results.secretKeyError = "Secret key is not set";
  }

  return res.status(200).json(results);
}
