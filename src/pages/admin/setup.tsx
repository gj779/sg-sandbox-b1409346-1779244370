
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Shield, AlertCircle, CheckCircle, Key } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Fix hydration issues by ensuring client-side rendering is consistent
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Call the API endpoint to set up the admin account
      const response = await fetch("/api/set-staffspace-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secretKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to set up admin account");
      }

      setSuccess(data.message);
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred while setting up the admin account");
    } finally {
      setIsSubmitting(false);
    }
  };

  // The admin email address - keep it consistent
  const adminEmail = "staffspce@gmail.com";

  return (
    <>
      <Head>
        <title>Admin Setup | StaffSpace</title>
        <meta name="description" content="Set up the admin account for StaffSpace" />
      </Head>

      <div className="container max-w-md py-12">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Admin Setup</h1>
          <p className="text-muted-foreground text-center mt-2">
            Set up the admin account for StaffSpace
          </p>
        </div>

        {isClient && (
          <Card>
            <CardHeader>
              <CardTitle>Activate Admin Account</CardTitle>
              <CardDescription>
                Enter the secret key to activate the admin account for {adminEmail}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="secretKey" className="text-sm font-medium">
                      Secret Key
                    </label>
                  </div>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter the admin secret key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The secret key is required to activate the admin account. If you don't have it, please contact the system administrator.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !secretKey}
                >
                  {isSubmitting ? "Processing..." : "Activate Admin Account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an admin account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push("/auth/login")}
                >
                  Sign in
                </Button>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
