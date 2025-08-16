import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, ArrowLeft } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/common/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { redirect } = router.query;
  const [email, setEmail] = useState(""); // Default for convenience
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Destructure correct functions and state from useUser
  const { signIn, userProfile, isLoading: authIsLoading, error: authError, clearAuthError } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    // Clear previous errors when component mounts
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.userType === "admin") {
        const redirectPath = (redirect as string) || "/admin/dashboard";
        router.push(redirectPath);
      } else {
        // If logged in user is not an admin, redirect them appropriately
        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges.",
          variant: "destructive",
        });
        // Redirect to their respective dashboard or home
        const nonAdminRedirect = userProfile.userType === "restaurant" ? "/restaurant/dashboard" : "/applicant/dashboard";
        router.push(nonAdminRedirect);
      }
    }
  }, [userProfile, router, redirect, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }
    
    const profile = await signIn(email, password);
    if (profile && profile.userType !== "admin") {
        // This case is handled by useEffect, but good to have explicit feedback if needed
        toast({
          title: "Access Denied",
          description: "This account does not have administrator privileges.",
          variant: "destructive",
        });
    } else if (!profile && !authError) { // If signIn returns null but no authError, it might be a logic issue
        toast({
          title: "Sign-In Issue",
          description: "Could not complete sign-in. Please try again.",
          variant: "destructive",
        });
    }
    // If signIn is successful and user is admin, useEffect will redirect.
    // If signIn fails, authError will be set and displayed by the Alert component.
  };

  return (
    <>
      <Head>
        <title>Admin Sign In | StaffSpace</title>
        <meta name="description" content="Sign in to your StaffSpace administrator account." />
      </Head>

      <div className="container max-w-md py-12">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="mb-6">
            <Logo width={60} height={60} />
          </div>
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Sign in to access the administrator dashboard</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Admin Sign In
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/auth/login")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {authError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="staffspace@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Password</Label>
                  <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="admin-remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="admin-remember" className="text-sm">Remember me</Label>
              </div>
              <Button 
                type="submit"
                className="w-full" 
                disabled={authIsLoading}
              >
                {authIsLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-center text-muted-foreground">
              Need to set up an admin account?{" "}
              <Link href="/admin/setup" className="text-primary hover:underline">
                Admin Setup
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}