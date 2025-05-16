
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChefHat, Briefcase, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Layout from "@/components/layout/Layout";
import AuthForm from "@/components/auth/AuthForm";
import { UserRole } from "@/types";

export default function LoginPage() {
  const { user, userProfile, isLoading: authIsLoading, error: authError, clearAuthError } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { type: queryType, redirect: queryRedirect } = router.query;
  
  const [currentTab, setCurrentTab] = useState<"applicant" | "restaurant">(
    (queryType as string === "restaurant" ? "restaurant" : "applicant")
  );

  useEffect(() => {
    // Clear previous errors when component mounts or tab changes
    clearAuthError();
  }, [clearAuthError, currentTab]);

  useEffect(() => {
    if (user && userProfile) {
      const defaultRedirectPath = userProfile.userType === UserRole.ADMIN ? "/admin/dashboard"
                                : userProfile.userType === UserRole.RESTAURANT ? "/restaurant/dashboard"
                                : "/applicant/dashboard";
      const redirectPath = (queryRedirect as string) || defaultRedirectPath;
      router.push(redirectPath);
    }
  }, [user, userProfile, router, queryRedirect]);

  const handleAuthSuccess = () => {
    toast({
      title: "Sign in successful",
      description: `Welcome back, ${userProfile?.firstName || user?.displayName || "User"}!`,
    });
    // Redirection is handled by the useEffect above
  };
  
  const handleGoogleError = (error: Error) => {
    toast({
      title: "Google Sign-In Failed",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <Layout>
      <Head>
        <title>Sign In | StaffSpace</title>
        <meta name="description" content="Sign in to your StaffSpace account to find restaurant jobs or hire talented staff." />
      </Head>

      <div className="container max-w-md py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your StaffSpace account</p>
        </div>

        <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value as "applicant" | "restaurant")} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="applicant" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Job Seeker
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Restaurant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applicant">
            <Card>
              <CardHeader>
                <CardTitle>Job Seeker Sign In</CardTitle>
                <CardDescription>
                  Sign in to find restaurant and hospitality jobs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <AuthForm mode="login" onSuccess={handleAuthSuccess} />
                <div className="mt-4 flex items-center">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>
                <div className="mt-4">
                  <GoogleSignInButton 
                    userType={UserRole.APPLICANT}
                    onError={handleGoogleError}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <p className="text-sm text-center text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register?type=applicant" legacyBehavior>
                    <a className="text-primary hover:underline">Create account</a>
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="restaurant">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Sign In</CardTitle>
                <CardDescription>
                  Sign in to find talented staff for your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <AuthForm mode="login" onSuccess={handleAuthSuccess} />
                 <div className="mt-4 flex items-center">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>
                <div className="mt-4">
                  <GoogleSignInButton 
                    userType={UserRole.RESTAURANT}
                    onError={handleGoogleError}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <p className="text-sm text-center text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register?type=restaurant" legacyBehavior>
                    <a className="text-primary hover:underline">Create account</a>
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
