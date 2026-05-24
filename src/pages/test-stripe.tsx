import { useState } from "react";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function TestStripePage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testStripeKeys = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch("/api/payments/verify-stripe-keys");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        configured: false,
        error: "Failed to connect to API",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Stripe Configuration | StaffSpace</title>
      </Head>

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Stripe Configuration Test</h1>
          <p className="text-muted-foreground mb-8">
            Verify your Stripe API keys are properly configured
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Click the button below to test your Stripe configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={testStripeKeys}
                disabled={testing}
                className="w-full"
              >
                {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Stripe Keys
              </Button>

              {result && (
                <div className="space-y-4 mt-6">
                  {/* Configuration Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Stripe Configured</span>
                    {result.configured ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        No
                      </Badge>
                    )}
                  </div>

                  {/* Environment */}
                  {result.environment && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Environment</span>
                      <Badge variant={result.environment === "test" ? "secondary" : "default"}>
                        {result.environment.toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {/* Test Mode */}
                  {result.testMode !== undefined && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">Test Mode</span>
                      {result.testMode ? (
                        <Badge variant="secondary">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="default">Live Mode</Badge>
                      )}
                    </div>
                  )}

                  {/* Publishable Key */}
                  {result.publishableKey && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <span className="font-medium block">Publishable Key</span>
                      <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                        {result.publishableKey}
                      </code>
                    </div>
                  )}

                  {/* Secret Key Preview */}
                  {result.secretKeyPreview && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <span className="font-medium block">Secret Key</span>
                      <code className="text-xs bg-muted p-2 rounded block">
                        {result.secretKeyPreview}
                      </code>
                    </div>
                  )}

                  {/* Error Message */}
                  {result.error && (
                    <div className="p-4 border border-red-500 rounded-lg bg-red-50 dark:bg-red-950">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {result.configured && !result.error && (
                    <div className="p-4 border border-green-500 rounded-lg bg-green-50 dark:bg-green-950">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✅ Stripe is properly configured and ready to use!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Next Steps:</h3>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Make sure your Stripe keys are added to .env.local</li>
                  <li>Restart your development server after adding keys</li>
                  <li>Click "Test Stripe Keys" to verify configuration</li>
                  <li>Once verified, try the pricing and payment pages</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}