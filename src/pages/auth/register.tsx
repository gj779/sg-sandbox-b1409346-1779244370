
import { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();
  const { type } = router.query;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (userType: "applicant" | "restaurant") => {
    setIsLoading(true);
    
    // Mock registration - in a real app, this would create a user in Firebase
    setTimeout(() => {
      setIsLoading(false);
      
      if (userType === "applicant") {
        router.push("/applicant/create-resume");
      } else {
        router.push("/restaurant/setup-profile");
      }
    }, 1000);
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

        <Tabs defaultValue={type as string || "applicant"} className="w-full">
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
                <CardTitle>Job Seeker Registration</CardTitle>
                <CardDescription>
                  Create an account to find restaurant and hospitality jobs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicant-name">Full Name</Label>
                  <Input
                    id="applicant-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicant-email">Email</Label>
                  <Input
                    id="applicant-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicant-password">Password</Label>
                  <Input
                    id="applicant-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicant-confirm-password">Confirm Password</Label>
                  <Input
                    id="applicant-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="applicant-terms" 
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <Label htmlFor="applicant-terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister("applicant")}
                  disabled={isLoading || !agreeTerms}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
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
                <CardTitle>Restaurant Registration</CardTitle>
                <CardDescription>
                  Create an account to find talented staff for your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    placeholder="Restaurant Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-email">Business Email</Label>
                  <Input
                    id="restaurant-email"
                    type="email"
                    placeholder="restaurant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-password">Password</Label>
                  <Input
                    id="restaurant-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-confirm-password">Confirm Password</Label>
                  <Input
                    id="restaurant-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="restaurant-terms" 
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <Label htmlFor="restaurant-terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister("restaurant")}
                  disabled={isLoading || !agreeTerms}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
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
