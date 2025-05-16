
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, XCircle, FileText, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentIntent } from "@/services/stripeService";
import { useAuth } from "@/hooks/useFirebaseAuth";

interface PaymentHistoryProps {
  customerId?: string;
  limit?: number;
  showRefundButton?: boolean;
  onRefund?: (paymentId: string) => void;
  onViewInvoice?: (paymentId: string) => void;
}

export default function PaymentHistory({
  customerId,
  limit = 10,
  showRefundButton = false,
  onRefund,
  onViewInvoice
}: PaymentHistoryProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentIntent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState<string | null>(null);

  // Fetch payment history
  useEffect(() => {
    async function fetchPaymentHistory() {
      if (!user && !customerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payments/history?${customerId ? `customerId=${customerId}` : ''}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch payment history");
        }

        const data = await response.json();
        setPayments(data.payments || []);
      } catch (err: any) {
        console.error("Error fetching payment history:", err);
        setError(err.message || "An error occurred while fetching payment history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentHistory();
  }, [user, customerId, limit]);

  // Handle refund
  const handleRefund = async (paymentId: string) => {
    if (!onRefund) return;
    
    setIsRefunding(paymentId);
    
    try {
      await onRefund(paymentId);
      
      // Update payment status in the list
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: "refunded" } 
            : payment
        )
      );
    } catch (err) {
      console.error("Error processing refund:", err);
    } finally {
      setIsRefunding(null);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" /> Succeeded
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <RefreshCw className="h-3 w-3 mr-1" /> Refunded
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" /> Failed
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
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          View your recent payment transactions
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
        ) : payments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No payment history found.
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.created)}</TableCell>
                    <TableCell>{formatAmount(payment.amount)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {onViewInvoice && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewInvoice(payment.id)}
                            className="h-8 px-2 text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" /> Invoice
                          </Button>
                        )}
                        
                        {showRefundButton && payment.status === "succeeded" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRefund(payment.id)}
                            disabled={!!isRefunding}
                            className="h-8 px-2 text-xs text-red-500 border-red-200 hover:bg-red-50"
                          >
                            {isRefunding === payment.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...
                              </>
                            ) : (
                              <>Refund</>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
