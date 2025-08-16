import { debugCreateAccount } from "./debugAuth";
import { UserRole } from "@/types";

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
      
      // Small delay between account creations
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
