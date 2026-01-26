import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Loader2, Shield, Key, Mail } from "lucide-react";

export default function AdminQuickSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state for making existing user admin
  const [email, setEmail] = useState("info@thestaffspace.com");
  const [secretKey, setSecretKey] = useState("");

  // Form state for creating new admin
  const [newEmail, setNewEmail] = useState("info@thestaffspace.com");
  const [newPassword, setNewPassword] = useState("");
  const [newSecretKey, setNewSecretKey] = useState("");

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/make-admin-by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          secretKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.message || "Failed to make user admin" });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/setup-admin-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          secretKey: newSecretKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || "Failed to create admin" });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Quick Setup</h1>
          <p className="text-slate-600">Configure administrator access for StaffSpace</p>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Setup Administrator</CardTitle>
            <CardDescription className="text-base">
              Choose the method that fits your situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="existing" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="existing" className="text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Existing User
                </TabsTrigger>
                <TabsTrigger value="new" className="text-sm">
                  <Key className="w-4 h-4 mr-2" />
                  New Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing">
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-900">
                      Use this if <strong>info@thestaffspace.com</strong> already has a registered account.
                      This will upgrade the existing user to admin status.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleMakeAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@thestaffspace.com"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secretKey" className="text-sm font-medium">
                        Admin Secret Key
                      </Label>
                      <Input
                        id="secretKey"
                        type="password"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter your ADMIN_SECRET_KEY"
                        required
                        className="h-11 font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        This is the <code className="bg-slate-100 px-1 py-0.5 rounded">ADMIN_SECRET_KEY</code> from your environment variables
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-11 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="new">
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertDescription className="text-sm text-amber-900">
                      Use this if the account <strong>doesn't exist yet</strong>. This will create a new user
                      account with admin privileges.
                    </AlertDescription>
                  </Alert>

                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="info@thestaffspace.com"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Choose a strong password"
                        required
                        minLength={8}
                        className="h-11"
                      />
                      <p className="text-xs text-slate-500">
                        Minimum 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newSecretKey" className="text-sm font-medium">
                        Admin Secret Key
                      </Label>
                      <Input
                        id="newSecretKey"
                        type="password"
                        value={newSecretKey}
                        onChange={(e) => setNewSecretKey(e.target.value)}
                        placeholder="Enter your ADMIN_SECRET_KEY"
                        required
                        className="h-11 font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500">
                        This is the <code className="bg-slate-100 px-1 py-0.5 rounded">ADMIN_SECRET_KEY</code> from your environment variables
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-11 text-base bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Create Admin Account
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>

            {result && (
              <Alert 
                className={`mt-6 ${
                  result.success 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className={`text-sm ${
                      result.success ? "text-green-900" : "text-red-900"
                    }`}>
                      {result.message}
                    </AlertDescription>
                    {result.success && (
                      <div className="mt-3">
                        <Button 
                          onClick={() => window.location.href = "/auth/admin-login"}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Go to Admin Login
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 shadow-lg border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-slate-900">Step 1: Generate Secret Key</p>
              <p>Run this in your terminal to generate a secure random key:</p>
              <code className="block bg-slate-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
                node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
              </code>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-slate-900">Step 2: Add to Environment</p>
              <p>In Softgen: Settings → Environment → Add Variable:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li><strong>Key:</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">ADMIN_SECRET_KEY</code></li>
                <li><strong>Value:</strong> [paste your generated key]</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-slate-900">Step 3: Use the Form Above</p>
              <p>Choose the appropriate tab and enter the secret key you just added.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}