
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import stripe from "@/lib/stripe-server";
import { adminDb } from "@/lib/firebase-admin";
import type { Stripe } from "stripe";

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

    // Get the invoice ID from the URL
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    // Check if the user has access to this invoice
    const invoiceRef = adminDb.collection("invoices").doc(id);
    const invoiceDoc = await invoiceRef.get();

    if (!invoiceDoc.exists) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const invoiceData = invoiceDoc.data();
    if (invoiceData?.userId !== userId) {
      return res.status(403).json({ error: "Not authorized to access this invoice" });
    }

    // Get the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceData.stripeInvoiceId, {
      expand: ["payment_intent", "subscription", "customer"],
    });

    // If PDF format is requested, return the invoice PDF URL
    const format = req.query.format;
    if (format === "pdf") {
      return res.status(200).json({ 
        pdfUrl: invoice.invoice_pdf 
      });
    }

    // Return the invoice data
    return res.status(200).json({
      id: invoiceDoc.id,
      ...invoiceData,
      stripeInvoice: invoice,
    });
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    return res.status(500).json({ error: "Failed to retrieve invoice" });
  }
}
