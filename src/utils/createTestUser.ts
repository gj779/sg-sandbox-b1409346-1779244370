import { debugCreateAccount } from "./debugAuth";
import { UserRole } from "@/types";

/**
 * WARNING: This function triggers multiple sequential Firebase Auth account creations
 * from client-side code, which can trigger Firebase's brute-force protection and
 * result in auth/too-many-requests errors.
 * 
 * RECOMMENDED: Move this functionality to a server-side API route using firebase-admin
 * SDK's admin.auth().importUsers() for batch account creation without rate limits.
 */
export const createBasicTestAccounts = async () => {
  console.log("Creating basic test accounts...");
  
  const testAccounts = [
    {
      email: "applicant@staffspace.test",
      password: "testpassword123",
      firstName: "John",
      lastName: "Applicant",
      userType: UserRole.APPLICANT
    },
    {
      email: "restaurant@staffspace.test", 
      password: "testpassword123",
      firstName: "Restaurant",
      lastName: "Owner",
      userType: UserRole.RESTAURANT
    }
  ];

  const results = [];
  
  for (const account of testAccounts) {
    try {
      console.log(`Creating account: ${account.email}`);
      const result = await debugCreateAccount(
        account.email,
        account.password,
        account.firstName,
        account.lastName,
        account.userType
      );
      
      results.push({
        email: account.email,
        success: result.success,
        message: result.success ? "Account created successfully" : result.error
      });
      
      // Small delay between account creations (does NOT prevent rate limiting)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`Failed to create account ${account.email}:`, error);
      results.push({
        email: account.email,
        success: false,
        message: error.message || "Unknown error"
      });
    }
  }
  
  console.log("Test account creation results:", results);
  return results;
};
