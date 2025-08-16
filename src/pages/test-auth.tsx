
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const { signIn, signUp, signOut, user, userProfile, error, isLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSignUp = async () => {
    await signUp(email, password, firstName, lastName, UserRole.APPLICANT);
  };

  const handleSignIn = async () => {
    await signIn(email, password);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Authentication Test Page</h1>
      
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>Signed In Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>User ID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
            {userProfile && (
              <div className="mt-4">
                <h3 className="font-semibold">User Profile:</h3>
                <p><strong>Name:</strong> {userProfile.firstName} {userProfile.lastName}</p>
                <p><strong>User Type:</strong> {userProfile.userType}</p>
                <p><strong>Profile Complete:</strong> {userProfile.profileComplete ? "Yes" : "No"}</p>
                <p><strong>Created:</strong> {userProfile.createdAt?.toString()}</p>
              </div>
            )}
            <Button onClick={handleSignOut} className="mt-4">Sign Out</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={handleSignUp} disabled={isLoading}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign In Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={handleSignIn} disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Card className="mt-4 border-red-500">
          <CardContent className="p-4">
            <p className="text-red-600"><strong>Error:</strong> {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
