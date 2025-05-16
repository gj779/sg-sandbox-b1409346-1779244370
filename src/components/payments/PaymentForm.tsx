
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
  buttonText?: string;
}

export default function PaymentForm({
  amount,
  currency = "usd",
  description = "Payment",
  onSuccess,
  onError,
  buttonText = "Pay Now"
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a payment intent on the server
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret } = await response.json();

      // Use the client secret to confirm the payment
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message || "Payment failed");
      }

      if (paymentIntent.status === "succeeded") {
        toast({
          title: "Payment successful",
          description: `Payment of ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} was successful.`,
        });
        
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during payment");
      
      toast({
        title: "Payment failed",
        description: err.message || "An error occurred during payment",
        variant: "destructive",
      });
      
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          {description} - {(amount / 100).toFixed(2)} {currency.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-element">Card Information</Label>
            <div className="border rounded-md p-3">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!stripe || isLoading} 
            className="w-full"
          >
            {isLoading ? "Processing..." : buttonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
