
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Subscription } from "@/services/stripeService";

interface SubscriptionManagementProps {
  customerId?: string;
  onSubscriptionUpdated?: () => void;
}

export default function SubscriptionManagement({ 
  customerId, 
  onSubscriptionUpdated 
}: SubscriptionManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      if (!user && !customerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payments/subscription?${customerId ? `customerId=${customerId}` : ''}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch subscription data");
        }

        const data = await response.json();
        
        if (data.subscription) {
          setSubscription(data.subscription);
        } else {
          setSubscription(null);
        }
      } catch (err: any) {
        console.error("Error fetching subscription:", err);
        setError(err.message || "An error occurred while fetching subscription data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [user, customerId]);

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    setIsCancelling(true);
    
    try {
      const response = await fetch(`/api/payments/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      
      const data = await response.json();
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      
      // Update subscription data
      setSubscription(data.subscription);
      
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated();
      }
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      toast({
        title: "Error",
        description: err.message || "An error occurred while cancelling your subscription",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" /> Past Due
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your subscription plan and billing cycle
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !subscription ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
            <Button>
              Subscribe Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Current Plan</h3>
                <div className="flex items-center mt-1">
                  {getStatusBadge(subscription.status)}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Billing Period</h3>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Renews on {formatDate(subscription.current_period_end)}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Amount</h3>
                <div className="mt-1 font-medium">
                  ${(subscription.items.data[0]?.price?.unit_amount || 0) / 100}/month
                </div>
              </div>
            </div>
            
            {subscription.status === "active" && (
              <div className="flex justify-end">
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                      Cancel Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Subscription</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period on {formatDate(subscription.current_period_end)}.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        Keep Subscription
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Yes, Cancel"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {subscription && subscription.status === "canceled" && (
        <CardFooter className="border-t pt-6">
          <Button className="w-full">
            Reactivate Subscription
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
