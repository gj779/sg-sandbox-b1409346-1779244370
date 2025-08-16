import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAllTestAccounts, getTestCredentials, createTestAccount } from "@/utils/createTestAccounts";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserRole } from "@/types";
import { Loader2, CheckCircle, XCircle, User, Building, Shield } from "lucide-react";

export default function DebugAuthPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [signInResults, setSignInResults] = useState<any[]>([]);
  const router = useRouter();

  const testCredentials = getTestCredentials();

  const handleCreateAllAccounts = async () => {
    setIsCreating(true);
    setResults([]);
    
    try {
      const accountResults = await createAllTestAccounts();
      setResults(accountResults);
    } catch (error) {
      console.error("Failed to create test accounts:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsSigningIn(email);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      setSignInResults(prev => [...prev, {
        email,
        success: true,
        uid: user.uid,
        emailVerified: user.emailVerified
      }]);
      
      // Redirect after successful sign in
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (error: any) {
      console.error(`Sign in failed for ${email}:`, error);
      setSignInResults(prev => [...prev, {
        email,
        success: false,
        error: error.message
      }]);
    } finally {
      setIsSigningIn("");
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="w-4 h-4" />;
      case UserRole.RESTAURANT:
        return <Building className="w-4 h-4" />;
      case UserRole.APPLICANT:
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 border-red-300";
      case UserRole.RESTAURANT:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case UserRole.APPLICANT:
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              StaffSpace Authentication Debug Panel
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and test authentication with predefined test accounts
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateAllAccounts}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Test Accounts...
                </>
              ) : (
                "Create All Test Accounts"
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Account Creation Results:</h3>
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{result.email}</span>
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Accounts - Sign In</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click any account below to test sign in functionality
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testCredentials.map((account, index) => {
                const signInResult = signInResults.find(r => r.email === account.email);
                const isLoading = isSigningIn === account.email;
                
                return (
                  <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`border ${getRoleBadgeColor(account.role)}`}>
                          {getRoleIcon(account.role)}
                          <span className="ml-1">{account.role}</span>
                        </Badge>
                        {signInResult && (
                          signInResult.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">{account.displayName}</h4>
                        <p className="text-xs text-muted-foreground">{account.email}</p>
                        <p className="text-xs text-muted-foreground">Password: {account.password}</p>
                      </div>

                      <Button 
                        onClick={() => handleSignIn(account.email, account.password)}
                        disabled={isLoading || isSigningIn !== ""}
                        size="sm"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>

                      {signInResult && !signInResult.success && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {signInResult.error}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => router.push("/auth/login")} 
              variant="outline"
              className="w-full"
            >
              Go to Login Page
            </Button>
            <Button 
              onClick={() => router.push("/auth/register")} 
              variant="outline"
              className="w-full"
            >
              Go to Register Page
            </Button>
            <Button 
              onClick={() => router.push("/")} 
              variant="outline"
              className="w-full"
            >
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
