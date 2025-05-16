
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface KeyStatus {
  key: string;
  isSet: boolean;
  isValid?: boolean;
  error?: string;
}

export default function StripeKeyVerifier() {
  const [keyStatuses, setKeyStatuses] = useState<KeyStatus[]>([
    { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", isSet: false },
    { key: "STRIPE_SECRET_KEY", isSet: false }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if keys are set in environment variables
  useEffect(() => {
    // Check client-side key
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    // Update statuses with proper typing
    setKeyStatuses([
      { 
        key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", 
        isSet: Boolean(publishableKey && publishableKey.length > 0),
        isValid: undefined
      },
      { 
        key: "STRIPE_SECRET_KEY", 
        isSet: false, // Default to false for server-side key until verified
        isValid: undefined
      }
    ]);
    
    setIsLoading(false);
  }, []);

  // Verify keys with the server
  const verifyKeys = async () => {
    setIsVerifying(true);
    
    try {
      const response = await fetch("/api/payments/verify-stripe-keys", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to verify Stripe keys");
      }
      
      const data = await response.json();
      
      setKeyStatuses(prev => prev.map(status => {
        if (status.key === "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") {
          return {
            ...status,
            isValid: data.publishableKeyValid,
            error: data.publishableKeyError
          };
        } else if (status.key === "STRIPE_SECRET_KEY") {
          return {
            ...status,
            isSet: Boolean(data.secretKeySet),
            isValid: data.secretKeyValid,
            error: data.secretKeyError
          };
        }
        return status;
      }));
    } catch (error) {
      console.error("Error verifying Stripe keys:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  // Get overall status
  const allKeysSet = keyStatuses.every(status => status.isSet);
  const allKeysValid = keyStatuses.every(status => status.isValid === true);
  const anyKeyInvalid = keyStatuses.some(status => status.isValid === false);
  
  // Determine overall status
  let overallStatus = "unknown";
  if (allKeysSet && allKeysValid) {
    overallStatus = "valid";
  } else if (anyKeyInvalid) {
    overallStatus = "invalid";
  } else if (!allKeysSet) {
    overallStatus = "missing";
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Stripe API Keys
          {overallStatus === "valid" && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4 mr-1" /> Valid
            </Badge>
          )}
          {overallStatus === "invalid" && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              <XCircle className="h-4 w-4 mr-1" /> Invalid
            </Badge>
          )}
          {overallStatus === "missing" && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              <AlertTriangle className="h-4 w-4 mr-1" /> Missing
            </Badge>
          )}
          {overallStatus === "unknown" && (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
              <AlertTriangle className="h-4 w-4 mr-1" /> Unknown
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Verify that your Stripe API keys are properly configured for payment processing.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Key Status Table */}
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Key</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Validity</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {keyStatuses.map((status) => (
                    <tr key={status.key}>
                      <td className="px-4 py-3 font-mono text-sm">{status.key}</td>
                      <td className="px-4 py-3">
                        {status.isSet ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" /> Set
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            <XCircle className="h-3 w-3 mr-1" /> Not Set
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {status.isValid === true ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" /> Valid
                          </Badge>
                        ) : status.isValid === false ? (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                            <XCircle className="h-3 w-3 mr-1" /> Invalid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                            Not Verified
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Error Messages */}
            {keyStatuses.some(status => status.error) && (
              <Alert variant="destructive">
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {keyStatuses.map(status => 
                      status.error && (
                        <li key={`${status.key}-error`}>
                          <span className="font-mono text-sm">{status.key}</span>: {status.error}
                        </li>
                      )
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Setup Instructions */}
            {!allKeysSet && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="setup-instructions">
                  <AccordionTrigger>
                    <span className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                      Setup Instructions
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <p>To set up your Stripe API keys:</p>
                      
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <a 
                            href="https://dashboard.stripe.com/apikeys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            Log in to your Stripe Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </li>
                        <li>Get your API keys from the Developers → API keys section</li>
                        <li>Create or update your <span className="font-mono">.env.local</span> file in the project root with the following variables:</li>
                      </ol>
                      
                      <div className="bg-muted p-3 rounded-md font-mono text-xs">
                        <pre>
                          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key<br />
                          STRIPE_SECRET_KEY=sk_test_your_secret_key
                        </pre>
                      </div>
                      
                      <p>
                        <strong>Important:</strong> Use test keys for development and live keys for production.
                        Never commit your secret key to version control.
                      </p>
                      
                      <p>
                        After setting up your keys, restart your development server and refresh this page.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={verifyKeys} 
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <span className="animate-spin mr-2">⟳</span> Verifying...
            </>
          ) : (
            "Verify Keys"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
