
import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
// Make sure to add your secret key to .env.local
// STRIPE_SECRET_KEY=sk_test_...
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Latest API version
});

export default stripe;
