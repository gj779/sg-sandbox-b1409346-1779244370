
import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
// Make sure to add your secret key to .env.local
// STRIPE_SECRET_KEY=sk_test_...
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", // Use the latest API version
});

export default stripe;
