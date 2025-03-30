
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
  mode: "login" | "register";
  userType?: "applicant" | "restaurant";
}

export default function AuthForm({ mode, userType = "applicant" }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, isLoading, error } = useFirebaseAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (mode === "login") {
        await signIn(email, password);
        router.push(userType === "applicant" ? "/applicant/dashboard" : "/restaurant/dashboard");
      } else {
        // Validation
        if (!firstName || !lastName) {
          setFormError("Please provide your first and last name");
          return;
        }

        if (password.length < 6) {
          setFormError("Password must be at least 6 characters");
          return;
        }

        await signUp({
          email,
          password,
          userType: userType as "applicant" | "restaurant",
          firstName,
          lastName,
          phoneNumber: phoneNumber || undefined,
        });

        // Redirect to dashboard after successful registration
        router.push(userType === "applicant" ? "/applicant/dashboard" : "/restaurant/dashboard");
      }
    } catch (err: any) {
      setFormError(err.message || "Authentication failed");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : `Join as a ${userType} and start using StaffSpace`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input 
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {(formError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError || error}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading 
              ? "Processing..." 
              : mode === "login" 
                ? "Sign In" 
                : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {mode === "login" 
            ? "Don't have an account? " 
            : "Already have an account? "}
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => router.push(mode === "login" 
              ? `/auth/register?type=${userType}` 
              : "/auth/login")}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
