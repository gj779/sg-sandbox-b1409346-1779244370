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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, Briefcase } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AuthForm from "@/components/auth/AuthForm";
import { useToast } from "@/hooks/useToast"; // Assuming useToast is imported from a hooks file
import { Alert, AlertDescription } from "@/components/ui/alert"; // Assuming Alert component is available

export default function RegisterPage() {
  const { user, userProfile, signUp, isLoading: authIsLoading, error: authError, clearAuthError } = useUser(); // Changed register to signUp
  const router = useRouter();
  const { toast } = useToast();
  const { type: queryType, redirect: queryRedirect } = router.query;

  const [currentTab, setCurrentTab] = useState<"applicant" | "restaurant">(
    (queryType === "restaurant" ? "restaurant" : "applicant")
  );

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError, currentTab]);

  useEffect(() => {
    if (user && userProfile) {
      // If user is already signed in and has a profile, redirect them.
      // Check if profile is complete to decide onboarding or dashboard.
      const redirectPath = userProfile.profileComplete 
        ? (userProfile.userType === "restaurant" ? "/restaurant/dashboard" : "/applicant/dashboard")
        : "/onboarding";
      router.push((queryRedirect as string) || redirectPath);
    }
  }, [user, userProfile, router, queryRedirect]);

  const handleAuthSuccess = () => {
    toast({
      title: "Registration successful!",
      description: `Welcome, ${userProfile?.firstName || user?.displayName || "User"}! Please complete your profile.`,
    });
    // Redirection is handled by the useEffect above, or AuthForm's default
  };

  return (
    <>
      <Head>
        <title>Create Account | StaffSpace</title>
        <meta name="description" content="Create a StaffSpace account to find restaurant jobs or hire talented staff." />
      </Head>

      <div className="container max-w-md py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-muted-foreground mt-2">Join StaffSpace to connect with opportunities</p>
        </div>

        <Tabs defaultValue={currentTab} className="w-full">
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
                <CardTitle>Create Applicant Account</CardTitle>
                <CardDescription>
                  Sign up to find restaurant and hospitality jobs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <AuthForm mode="register" onSuccess={handleAuthSuccess} />
                <div className="mt-4 flex items-center">
                  {/* Additional content can go here */}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister("applicant")}
                  disabled={authIsLoading}
                >
                  {authIsLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login?type=applicant" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="restaurant">
            <Card>
              <CardHeader>
                <CardTitle>Create Restaurant Account</CardTitle>
                <CardDescription>
                  Sign up to find talented staff for your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {authError && (
                  <Alert variant="destructive">
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <AuthForm mode="register" onSuccess={handleAuthSuccess} />
                <div className="mt-4 flex items-center">
                  {/* Additional content can go here */}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister("restaurant")}
                  disabled={authIsLoading}
                >
                  {authIsLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login?type=restaurant" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}