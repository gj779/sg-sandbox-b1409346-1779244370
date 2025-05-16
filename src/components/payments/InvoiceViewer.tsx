
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Download, FileText, ExternalLink, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface InvoiceViewerProps {
  invoiceId: string;
  onClose?: () => void;
}

interface InvoiceData {
  id: string;
  number: string;
  created: number;
  customer_name: string;
  customer_email: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  currency: string;
  pdf_url: string;
  hosted_invoice_url: string;
  line_items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

export default function InvoiceViewer({ invoiceId, onClose }: InvoiceViewerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Fetch invoice data
  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payments/invoice/${invoiceId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch invoice data");
        }

        const data = await response.json();
        setInvoice(data.invoice);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        setError(err.message || "An error occurred while fetching invoice data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoice();
  }, [invoiceId]);

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format amount
  const formatAmount = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Download PDF
  const downloadPdf = async () => {
    if (!invoice?.pdf_url) return;
    
    setIsPdfLoading(true);
    
    try {
      // Open PDF in new tab
      window.open(invoice.pdf_url, "_blank");
      
      toast({
        title: "Invoice PDF opened",
        description: "The invoice PDF has been opened in a new tab.",
      });
    } catch (err: any) {
      console.error("Error opening PDF:", err);
      toast({
        title: "Error",
        description: "Failed to open the invoice PDF.",
        variant: "destructive",
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Print invoice
  const printInvoice = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoice {invoice?.number}</span>
          {invoice?.status === "paid" && (
            <span className="text-sm font-normal px-2 py-1 bg-green-100 text-green-800 rounded-md">
              Paid
            </span>
          )}
          {invoice?.status === "open" && (
            <span className="text-sm font-normal px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
              Unpaid
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {invoice && `Issued on ${formatDate(invoice.created)}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
        ) : invoice ? (
          <>
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Billed To</h3>
                <div className="text-sm">
                  <p className="font-medium">{invoice.customer_name}</p>
                  <p>{invoice.customer_email}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Invoice Details</h3>
                <div className="text-sm">
                  <p><span className="inline-block w-24">Invoice Number:</span> {invoice.number}</p>
                  <p><span className="inline-block w-24">Date:</span> {formatDate(invoice.created)}</p>
                  <p><span className="inline-block w-24">Status:</span> {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
                </div>
              </div>
            </div>
            
            {/* Line Items */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Invoice Items</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Quantity</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.line_items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatAmount(item.amount, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/20">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right font-medium">Total</td>
                      <td className="px-4 py-3 text-right font-medium">{formatAmount(invoice.amount_due, invoice.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right font-medium">Amount Paid</td>
                      <td className="px-4 py-3 text-right font-medium">{formatAmount(invoice.amount_paid, invoice.currency)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right font-medium">Amount Due</td>
                      <td className="px-4 py-3 text-right font-medium">{formatAmount(invoice.amount_due - invoice.amount_paid, invoice.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No invoice data found.
          </div>
        )}
      </CardContent>
      
      {invoice && (
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={downloadPdf}
            disabled={isPdfLoading || !invoice.pdf_url}
          >
            {isPdfLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={printInvoice}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          
          {invoice.hosted_invoice_url && (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => window.open(invoice.hosted_invoice_url, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Stripe
            </Button>
          )}
          
          {onClose && (
            <Button 
              variant="ghost" 
              className="w-full sm:w-auto sm:ml-auto"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// Invoice Dialog Component for easy integration
export function InvoiceViewerDialog({ 
  invoiceId, 
  trigger, 
  open, 
  onOpenChange 
}: { 
  invoiceId: string;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            View and download your invoice
          </DialogDescription>
        </DialogHeader>
        <InvoiceViewer 
          invoiceId={invoiceId} 
          onClose={() => onOpenChange?.(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
