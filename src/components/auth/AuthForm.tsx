
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, error: authError, isLoading: authIsLoading, clearAuthError } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setFormError(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }
      if (!firstName || !lastName) {
        setFormError("First and last name are required for registration.");
        return;
      }
    }

    try {
      let profile;
      if (mode === "login") {
        profile = await signIn(email, password);
      } else {
        const userType = router.query.type === "restaurant" ? UserRole.RESTAURANT : UserRole.APPLICANT;
        profile = await signUp(email, password, firstName, lastName, userType);
      }

      if (profile) {
        toast({
          title: mode === "login" ? "Sign In Successful" : "Registration Successful",
          description: `Welcome, ${profile.firstName || profile.email}!`,
        });
        if (onSuccess) {
          onSuccess();
        } else {
          const redirectPath = profile.userType === UserRole.ADMIN ? "/admin/dashboard"
                             : profile.userType === UserRole.RESTAURANT ? (profile.profileComplete ? "/restaurant/dashboard" : "/onboarding")
                             : (profile.profileComplete ? "/applicant/dashboard" : "/onboarding");
          router.push(redirectPath);
        }
      } else if (!authError) {
        setFormError(`Failed to ${mode}. Please try again.`);
      }
    } catch (err: any) {
      console.error(`${mode} error:`, err);
      setFormError(err.message || `An unexpected error occurred during ${mode}.`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : `Join as a ${router.query.type === "restaurant" ? "restaurant" : "applicant"} and start using StaffSpace`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(formError || authError) && (
            <Alert variant="destructive">
              <AlertDescription>{formError || authError}</AlertDescription>
            </Alert>
          )}
          {mode === "register" && (
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

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={authIsLoading}
          >
            {authIsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}