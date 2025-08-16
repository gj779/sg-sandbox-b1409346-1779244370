import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile, UserRole } from "@/types";

export const debugSignIn = async (email: string, password: string) => {
  console.log("=== DEBUG SIGN IN START ===");
  console.log("Email:", email);
  console.log("Firebase Auth initialized:", !!auth);
  console.log("Firebase DB initialized:", !!db);
  
  try {
    // Step 1: Try to sign in
    console.log("Step 1: Attempting Firebase Auth sign in...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Firebase Auth successful");
    console.log("User ID:", userCredential.user.uid);
    console.log("Email verified:", userCredential.user.emailVerified);
    
    // Step 2: Try to fetch user profile
    console.log("Step 2: Fetching user profile from Firestore...");
    const userRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log("✅ User profile found in Firestore");
      const profileData = userDoc.data();
      console.log("Profile data:", profileData);
      return { success: true, profile: profileData };
    } else {
      console.log("❌ User profile NOT found in Firestore");
      return { success: false, error: "Profile not found" };
    }
    
  } catch (error: any) {
    console.log("❌ Sign in failed");
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
    console.log("Full error:", error);
    return { success: false, error: error.message };
  }
};

export const debugCreateAccount = async (email: string, password: string, firstName: string, lastName: string, userType: UserRole) => {
  console.log("=== DEBUG CREATE ACCOUNT START ===");
  console.log("Email:", email);
  console.log("User Type:", userType);
  
  try {
    // Step 1: Create Firebase Auth account
    console.log("Step 1: Creating Firebase Auth account...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Firebase Auth account created");
    console.log("User ID:", userCredential.user.uid);
    
    // Step 2: Create Firestore profile
    console.log("Step 2: Creating Firestore profile...");
    const profile: Partial<UserProfile> = {
      id: userCredential.user.uid,
      email,
      displayName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      userType,
      profileComplete: false,
      isActive: true
    };
    
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("✅ Firestore profile created");
    return { success: true, userId: userCredential.user.uid };
    
  } catch (error: any) {
    console.log("❌ Account creation failed");
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);
    return { success: false, error: error.message };
  }
};

export const testExistingAccounts = async () => {
  console.log("=== TESTING EXISTING ACCOUNTS ===");
  
  const testAccounts = [
    { email: "sarah.applicant@staffspace.test", password: "testpassword123" },
    { email: "owner@bellaitalia.test", password: "testpassword123" }
  ];
  
  for (const account of testAccounts) {
    console.log(`\nTesting account: ${account.email}`);
    const result = await debugSignIn(account.email, account.password);
    console.log("Result:", result);
  }
};
