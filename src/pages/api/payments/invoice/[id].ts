
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import stripe from "@/lib/stripe-server";
import { firestore } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get invoice ID from the URL parameter
    const { id } = req.query;
    
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invoice ID is required" });
    }

    // Determine if this is a payment intent ID or an invoice ID
    const isPaymentIntentId = id.startsWith("pi_");
    const isInvoiceId = id.startsWith("in_");
    
    if (!isPaymentIntentId && !isInvoiceId) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Check authorization (unless admin override is provided)
    const isAdminRequest = req.query.admin === "true";
    
    if (!isAdminRequest) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const userId = decodedToken.uid;
        
        // For payment intents, verify the user owns this payment
        if (isPaymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(id);
          
          if (paymentIntent.customer) {
            // Get the user's customer ID
            const userDoc = await firestore.collection("users").doc(userId).get();
            const userData = userDoc.data();
            
            if (!userData || userData.stripeCustomerId !== paymentIntent.customer) {
              return res.status(403).json({ error: "You don't have permission to access this invoice" });
            }
          } else {
            // If no customer is associated, this is likely a guest payment
            // We could implement additional checks here if needed
          }
        }
      } catch (error) {
        return res.status(401).json({ error: "Invalid authentication token" });
      }
    }

    // Get the invoice data
    let invoice;
    
    if (isPaymentIntentId) {
      // For payment intents, we need to find the associated invoice
      const paymentIntent = await stripe.paymentIntents.retrieve(id);
      
      // Check if this payment has an invoice
      const invoices = await stripe.invoices.list({
        payment_intent: id
      });
      
      if (invoices.data.length === 0) {
        // No invoice found, create one
        const customer = paymentIntent.customer as string;
        
        if (!customer) {
          return res.status(404).json({ error: "No customer associated with this payment" });
        }
        
        // Create a new invoice for this payment
        invoice = await stripe.invoices.create({
          customer,
          auto_advance: true, // Auto-finalize the invoice
          description: `Invoice for payment ${id}`,
          metadata: {
            payment_intent_id: id
          }
        });
        
        // Finalize the invoice
        invoice = await stripe.invoices.finalizeInvoice(invoice.id);
        
        // Pay the invoice with the existing payment intent
        invoice = await stripe.invoices.pay(invoice.id, {
          paid_out_of_band: true // Mark as paid outside of Stripe
        });
      } else {
        // Use the existing invoice
        invoice = invoices.data[0];
      }
    } else {
      // For invoice IDs, just retrieve the invoice directly
      invoice = await stripe.invoices.retrieve(id, {
        expand: ["customer", "payment_intent", "lines.data"]
      });
    }

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Format the invoice data for the client
    const formattedInvoice = {
      id: invoice.id,
      number: invoice.number,
      created: invoice.created,
      customer_name: typeof invoice.customer === "object" ? invoice.customer.name : "Customer",
      customer_email: typeof invoice.customer === "object" ? invoice.customer.email : "",
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      status: invoice.status,
      currency: invoice.currency,
      pdf_url: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      line_items: invoice.lines.data.map((item: any) => ({
        description: item.description || "Product or service",
        amount: item.amount,
        quantity: item.quantity
      }))
    };

    return res.status(200).json({ invoice: formattedInvoice });
  } catch (error: any) {
    console.error("Invoice API error:", error);
    return res.status(500).json({ 
      error: "An error occurred while processing your request",
      message: error.message
    });
  }
}
