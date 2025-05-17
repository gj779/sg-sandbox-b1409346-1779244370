
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import stripeService from "@/services/stripeService";
import { adminDb } from "@/lib/firebase-admin";

interface PaymentRecord {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: FirebaseFirestore.Timestamp;
  metadata?: Record<string, any>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
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

    // Get the user's payment history from Firestore
    const paymentsRef = adminDb.collection("payments");
    const paymentsSnapshot = await paymentsRef
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PaymentRecord[];

    // Get detailed payment information from Stripe
    const paymentDetails = await Promise.all(
      payments.map(async payment => {
        try {
          const stripePayment = await stripeService.retrievePayment(payment.stripePaymentId);
          return {
            ...payment,
            stripeDetails: stripePayment
          };
        } catch (error) {
          console.error(`Error retrieving Stripe payment ${payment.stripePaymentId}:`, error);
          return payment;
        }
      })
    );

    return res.status(200).json(paymentDetails);
  } catch (error) {
    console.error("Error retrieving payment history:", error);
    return res.status(500).json({ error: "Failed to retrieve payment history" });
  }
}
