import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserRole } from "@/types";

interface TestAccount {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
}

const testAccounts: TestAccount[] = [
  {
    email: "john.applicant@test.com",
    password: "TestPass123!",
    role: UserRole.APPLICANT,
    displayName: "John Doe (Applicant)"
  },
  {
    email: "restaurant.owner@test.com", 
    password: "TestPass123!",
    role: UserRole.RESTAURANT,
    displayName: "Pizza Palace"
  },
  {
    email: "admin@staffspace.com",
    password: "AdminPass123!",
    role: UserRole.ADMIN,
    displayName: "StaffSpace Admin"
  },
  {
    email: "jane.server@test.com",
    password: "TestPass123!",
    role: UserRole.APPLICANT,
    displayName: "Jane Smith (Server)"
  },
  {
    email: "burger.joint@test.com",
    password: "TestPass123!",
    role: UserRole.RESTAURANT,
    displayName: "Burger Joint"
  }
];

export async function createTestAccount(account: TestAccount) {
  try {
    console.log(`Creating test account: ${account.email}`);
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      account.email,
      account.password
    );
    
    const user = userCredential.user;
    console.log(`Auth user created: ${user.uid}`);
    
    // Base profile data common to all roles
    const baseProfileData = {
      id: user.uid,
      email: account.email,
      userType: account.role,
      firstName: account.displayName.split(" ")[0],
      lastName: account.displayName.split(" ")[1] || "User",
      phoneNumber: "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      profileComplete: false
    };

    // Role-specific fields only
    const roleSpecificData = account.role === UserRole.RESTAURANT 
      ? {
          businessName: account.displayName,
          businessAddress: "123 Test St, Test City, TS 12345"
        }
      : account.role === UserRole.APPLICANT
      ? {
          skills: [],
          availability: []
        }
      : {};
    
    const profileData = {
      ...baseProfileData,
      ...roleSpecificData
    };
    
    await setDoc(doc(db, "users", user.uid), profileData);
    console.log(`Profile created for: ${account.email}`);
    
    return {
      success: true,
      uid: user.uid,
      email: account.email,
      role: account.role
    };
    
  } catch (error: any) {
    console.error(`Failed to create test account ${account.email}:`, error);
    return {
      success: false,
      error: error.message,
      email: account.email
    };
  }
}

/**
 * WARNING: This function triggers multiple sequential Firebase Auth account creations
 * from client-side code, which can trigger Firebase's brute-force protection and
 * result in auth/too-many-requests errors.
 * 
 * RECOMMENDED: Move this functionality to a server-side API route using firebase-admin
 * SDK's admin.auth().importUsers() for batch account creation without rate limits.
 */
export async function createAllTestAccounts() {
  const results = [];
  
  for (const account of testAccounts) {
    const result = await createTestAccount(account);
    results.push(result);
    
    // Small delay between account creation (does NOT prevent rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

export function getTestCredentials() {
  return testAccounts.map(account => ({
    email: account.email,
    password: account.password,
    role: account.role,
    displayName: account.displayName
  }));
}