
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/types";

export default function FirebaseConnectionTest() {
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult("🔍 Starting Firebase connection tests...");
    
    // Test 1: Check Firebase Auth initialization
    try {
      if (!auth) {
        addResult("❌ Firebase Auth not initialized");
        return;
      }
      addResult("✅ Firebase Auth initialized successfully");
    } catch (error) {
      addResult(`❌ Firebase Auth error: ${error}`);
    }

    // Test 2: Check Firestore initialization
    try {
      if (!db) {
        addResult("❌ Firestore not initialized");
        return;
      }
      addResult("✅ Firestore initialized successfully");
    } catch (error) {
      addResult(`❌ Firestore error: ${error}`);
    }

    // Test 3: Test authentication (if credentials provided)
    if (testEmail && testPassword) {
      try {
        addResult("🔐 Testing authentication...");
        const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        addResult(`✅ Authentication successful for: ${result.user.email}`);
        
        // Test 4: Test Firestore user document retrieval
        try {
          addResult("📄 Testing user profile retrieval...");
          const userRef = doc(db, "users", result.user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            addResult(`✅ User profile found: ${JSON.stringify(userDoc.data(), null, 2)}`);
          } else {
            addResult("⚠️ User profile not found in Firestore");
          }
        } catch (error) {
          addResult(`❌ Firestore query error: ${error}`);
        }
        
        // Sign out after test
        await auth.signOut();
        addResult("✅ Test sign-out successful");
        
      } catch (error: any) {
        addResult(`❌ Authentication failed: ${error.code} - ${error.message}`);
      }
    } else {
      addResult("⚠️ No test credentials provided - skipping auth test");
    }
    
    setIsLoading(false);
  };

  const testSignUp = async () => {
    if (!testEmail || !testPassword) {
      addResult("❌ Please provide email and password for sign-up test");
      return;
    }

    setIsLoading(true);
    
    try {
      addResult("🆕 Testing sign-up process...");
      
      // Create test account
      const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      addResult(`✅ Sign-up successful for: ${result.user.email}`);
      
      // Create user profile in Firestore
      const profile = {
        id: result.user.uid,
        userId: result.user.uid,
        email: testEmail,
        displayName: "Test User",
        firstName: "Test",
        lastName: "User",
        userType: UserRole.APPLICANT,
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const userRef = doc(db, "users", result.user.uid);
      await setDoc(userRef, profile);
      addResult("✅ User profile created in Firestore");
      
      // Clean up - delete the test user
      await result.user.delete();
      addResult("✅ Test user deleted successfully");
      
    } catch (error: any) {
      addResult(`❌ Sign-up test failed: ${error.code} - ${error.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔧 Firebase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testEmail">Test Email</Label>
          <Input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="testPassword">Test Password</Label>
          <Input
            id="testPassword"
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            placeholder="Enter test password"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testFirebaseConnection} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Testing..." : "Test Sign-In"}
          </Button>
          
          <Button 
            onClick={testSignUp} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? "Testing..." : "Test Sign-Up"}
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <Label>Test Results:</Label>
            {testResults.map((result, index) => (
              <Alert key={index} className="text-sm">
                <AlertDescription className="whitespace-pre-wrap font-mono">
                  {result}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
