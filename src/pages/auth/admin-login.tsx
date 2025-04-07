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
  const [email, setEmail] = useState("staffspace@gmail.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in user
      const { userProfile, dashboardPath } = await login(email, password);
      
      // Verify this is an admin account
      if (userProfile.userType !== "admin") {
        throw new Error("This login is only for administrators. Please use the regular login page.");
      }
      
      // Show success message
      toast({
        title: "Success",
        description: "You have successfully signed in as an administrator.",
        variant: "default",
      });

      console.log("Admin login successful, redirecting to dashboard");
      
      // Redirect to admin dashboard - force the path to be the admin dashboard
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 500);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
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
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                {error}
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
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
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