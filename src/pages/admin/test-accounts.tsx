
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Copy, Users, Store, Play, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { testSeeder, TEST_ACCOUNTS } from "@/utils/testAccountSeeder";
import { testExistingAccounts, debugSignIn, debugCreateAccount } from "@/utils/debugAuth";
import { UserRole } from "@/types";
import Layout from "@/components/layout/Layout";

export default function TestAccountsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [creationResults, setCreationResults] = useState<any[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleCreateAllAccounts = async () => {
    setIsCreating(true);
    setCreationResults([]);
    
    try {
      const results = [];
      
      for (const testAccount of TEST_ACCOUNTS) {
        const result = await testSeeder.createTestAccount(testAccount);
        results.push({
          email: testAccount.email,
          displayName: testAccount.displayName,
          role: testAccount.role,
          ...result
        });
        setCreationResults([...results]);
        
        // Small delay between creations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error creating test accounts:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateByRole = async (role: UserRole) => {
    setIsCreating(true);
    setCreationResults([]);
    
    try {
      const accountsForRole = TEST_ACCOUNTS.filter(account => account.role === role);
      const results = [];
      
      for (const testAccount of accountsForRole) {
        const result = await testSeeder.createTestAccount(testAccount);
        results.push({
          email: testAccount.email,
          displayName: testAccount.displayName,
          role: testAccount.role,
          ...result
        });
        setCreationResults([...results]);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error creating test accounts:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const applicantAccounts = TEST_ACCOUNTS.filter(account => account.role === UserRole.APPLICANT);
  const restaurantAccounts = TEST_ACCOUNTS.filter(account => account.role === UserRole.RESTAURANT);

  const handleDebugAuth = async () => {
    console.log("Running debug auth tests...");
    await testExistingAccounts();
  };

  const handleTestSignIn = async () => {
    const result = await debugSignIn("sarah.applicant@staffspace.test", "testpassword123");
    console.log("Test sign in result:", result);
  };

  const handleTestCreateAccount = async () => {
    const result = await debugCreateAccount(
      "test.user@staffspace.test", 
      "testpassword123", 
      "Test", 
      "User", 
      UserRole.APPLICANT
    );
    console.log("Test create account result:", result);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Account Manager</h1>
          <p className="text-muted-foreground">
            Create and manage test accounts for StaffSpace development and testing
          </p>
        </div>

        {/* Action Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Create test accounts with pre-filled profile data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleCreateAllAccounts} 
                disabled={isCreating}
                size="lg"
              >
                {isCreating ? "Creating..." : "Create All Test Accounts"}
              </Button>
              
              <Button 
                onClick={() => handleCreateByRole(UserRole.APPLICANT)}
                disabled={isCreating}
                variant="outline"
              >
                <Users className="w-4 h-4 mr-2" />
                Create Job Seekers Only
              </Button>
              
              <Button 
                onClick={() => handleCreateByRole(UserRole.RESTAURANT)}
                disabled={isCreating}
                variant="outline"
              >
                <Store className="w-4 h-4 mr-2" />
                Create Restaurants Only
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPasswords ? "Hide" : "Show"} Passwords
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Creation Results */}
        {creationResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Creation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {creationResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    {result.success ? 
                      <CheckCircle className="w-4 h-4 text-green-600" /> : 
                      <XCircle className="w-4 h-4 text-red-600" />
                    }
                    <span className="flex-1">{result.message}</span>
                    <Badge variant={result.role === UserRole.APPLICANT ? "default" : "secondary"}>
                      {result.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Job Seeker Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Job Seeker Test Accounts
              </CardTitle>
              <CardDescription>
                {applicantAccounts.length} test accounts for applicants/job seekers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {applicantAccounts.map((account, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{account.displayName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {account.profileData.bio?.substring(0, 80)}...
                      </p>
                    </div>
                    <Badge variant="default">Applicant</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-20">Email:</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {account.email}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.email)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {showPasswords && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-20">Password:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                          {account.password}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.password)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {account.profileData.skills?.slice(0, 3).map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {index < applicantAccounts.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Restaurant Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-600" />
                Restaurant Test Accounts
              </CardTitle>
              <CardDescription>
                {restaurantAccounts.length} test accounts for restaurants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {restaurantAccounts.map((account, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{account.profileData.restaurantName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Contact: {account.profileData.contactName} • {account.profileData.location}
                      </p>
                    </div>
                    <Badge variant="secondary">Restaurant</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-20">Email:</span>
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {account.email}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.email)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {showPasswords && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-20">Password:</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                          {account.password}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.password)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {account.profileData.cuisineType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {account.profileData.restaurantSize}
                    </Badge>
                  </div>

                  {index < restaurantAccounts.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>How to use these test accounts:</strong>
                <br />
                1. Click "Create All Test Accounts" to generate accounts in Firebase
                <br />
                2. Use the provided email/password combinations to sign in
                <br />
                3. Each account comes with realistic profile data pre-filled
                <br />
                4. Test different user flows for both job seekers and restaurants
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> If accounts already exist, the creation will skip them. 
                All passwords are set to "testpassword123" for easy testing.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Debug Authentication</h2>
          <div className="flex gap-4 mb-4">
            <Button onClick={handleDebugAuth} variant="outline">
              Debug Existing Accounts
            </Button>
            <Button onClick={handleTestSignIn} variant="outline">
              Test Sign In
            </Button>
            <Button onClick={handleTestCreateAccount} variant="outline">
              Test Create Account
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Check the browser console for detailed debug information.
          </p>
        </div>
      </div>
    </Layout>
  );
}