import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  status: string;
  message: string;
  currentUser?: string;
  error?: string;
  code?: string;
}

interface TestResults {
  envVars: Record<string, string>;
  connectionTest: TestResult | null;
  authTest: TestResult | null;
}

export default function FirebaseConfigTester() {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConfig = async () => {
    setIsLoading(true);
    const results: TestResults = {
      envVars: {},
      connectionTest: null,
      authTest: null
    };

    // Check environment variables
    results.envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Present" : "✗ Missing",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Present" : "✗ Missing",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Present" : "✗ Missing",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓ Present" : "✗ Missing",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓ Present" : "✗ Missing",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓ Present" : "✗ Missing"
    };

    // Test Firebase initialization
    try {
      const { auth } = await import("@/lib/firebase");
      results.connectionTest = {
        status: "success",
        message: "Firebase initialized successfully",
        currentUser: auth.currentUser?.email || "No user signed in"
      };
    } catch (error: any) {
      results.connectionTest = {
        status: "error",
        message: error.message,
        error: error.code || "Unknown error"
      };
    }

    // Test authentication
    try {
      const { signInAnonymously } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      await signInAnonymously(auth);
      results.authTest = {
        status: "success",
        message: "Firebase Auth working correctly"
      };
    } catch (error: any) {
      results.authTest = {
        status: "error",
        message: error.message,
        code: error.code
      };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Firebase Configuration Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={testFirebaseConfig} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Firebase Configuration"}
        </Button>

        {testResults && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(testResults.envVars).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{key}:</span>
                    <Badge variant={value.includes("✓") ? "default" : "destructive"}>
                      {value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Connection Test</h3>
              {testResults.connectionTest && (
                <Alert>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.connectionTest.status)}
                    <AlertDescription>
                      <strong>Status:</strong> {testResults.connectionTest.message}
                      {testResults.connectionTest.error && (
                        <div className="mt-1">
                          <strong>Error Code:</strong> {testResults.connectionTest.error}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Authentication Test</h3>
              {testResults.authTest && (
                <Alert>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.authTest.status)}
                    <AlertDescription>
                      <strong>Status:</strong> {testResults.authTest.message}
                      {testResults.authTest.code && (
                        <div className="mt-1">
                          <strong>Error Code:</strong> {testResults.authTest.code}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🔧 Fix Instructions:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
                <li>Select your "staffspace-8bab9" project</li>
                <li>Click the gear icon (⚙️) → Project Settings</li>
                <li>Scroll down to "Your apps" section</li>
                <li>Find your web app and copy the config object</li>
                <li>Update your .env.local file with the correct values</li>
                <li>Restart your development server (env variables are injected at build time)</li>
              </ol>
            </div>

            <Alert className="mt-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>⚠️ Security Notice:</strong> This debug component should only be accessible to administrators and must be removed or protected before deploying to production. Environment variables shown above are build-time values and require a server restart to update.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}