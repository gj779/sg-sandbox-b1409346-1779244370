
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { profilesService } from "@/services/profilesService";
import { UserRole, UserProfile } from "@/types";

export interface TestAccount {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  profileData: Partial<UserProfile>;
}

export const TEST_ACCOUNTS: TestAccount[] = [
  // Job Seeker Test Accounts
  {
    email: "sarah.applicant@staffspace.test",
    password: "testpassword123",
    role: UserRole.APPLICANT,
    displayName: "Sarah Johnson",
    profileData: {
      firstName: "Sarah",
      lastName: "Johnson",
      phoneNumber: "(555) 123-4567",
      location: "New York, NY",
      bio: "Experienced server with 3+ years in fine dining. Passionate about creating exceptional customer experiences.",
      experience: ["Fine Dining Server", "Bartender", "Customer Service"],
      skills: ["Customer Service", "POS Systems", "Wine Knowledge", "Team Collaboration"],
      availability: "Full-time, Evenings, Weekends",
      hourlyRate: 18
    }
  },
  {
    email: "mike.chef@staffspace.test", 
    password: "testpassword123",
    role: UserRole.APPLICANT,
    displayName: "Mike Rodriguez",
    profileData: {
      firstName: "Mike",
      lastName: "Rodriguez",
      phoneNumber: "(555) 987-6543",
      location: "Los Angeles, CA",
      bio: "Professional chef with 5 years experience in Italian cuisine. Specialized in pasta and seafood dishes.",
      experience: ["Line Cook", "Sous Chef", "Prep Cook"],
      skills: ["Italian Cuisine", "Knife Skills", "Food Safety", "Kitchen Management"],
      availability: "Full-time, Part-time",
      hourlyRate: 22
    }
  },
  {
    email: "emma.server@staffspace.test",
    password: "testpassword123", 
    role: UserRole.APPLICANT,
    displayName: "Emma Davis",
    profileData: {
      firstName: "Emma",
      lastName: "Davis",
      phoneNumber: "(555) 456-7890",
      location: "Chicago, IL",
      bio: "Energetic server and bartender with excellent multitasking skills. Fluent in Spanish and English.",
      experience: ["Server", "Bartender", "Host"],
      skills: ["Multitasking", "Bilingual", "Cash Handling", "Customer Relations"],
      availability: "Part-time, Weekends",
      hourlyRate: 16
    }
  },

  // Restaurant Test Accounts
  {
    email: "owner@bellaitalia.test",
    password: "testpassword123",
    role: UserRole.RESTAURANT,
    displayName: "Bella Italia Restaurant",
    profileData: {
      restaurantName: "Bella Italia",
      contactName: "Giovanni Rossi", 
      firstName: "Giovanni",
      lastName: "Rossi",
      phoneNumber: "(555) 111-2222",
      location: "Manhattan, NY",
      bio: "Authentic Italian restaurant in the heart of Manhattan. Family-owned since 1985, specializing in traditional Tuscan cuisine.",
      cuisineType: "Italian",
      restaurantSize: "Medium (50-100 seats)",
      description: "We pride ourselves on using fresh, imported ingredients and traditional cooking methods passed down through generations."
    }
  },
  {
    email: "manager@oceanview.test",
    password: "testpassword123",
    role: UserRole.RESTAURANT, 
    displayName: "Ocean View Bistro",
    profileData: {
      restaurantName: "Ocean View Bistro",
      contactName: "Lisa Chen",
      firstName: "Lisa", 
      lastName: "Chen",
      phoneNumber: "(555) 333-4444",
      location: "Santa Monica, CA",
      bio: "Upscale seafood restaurant with stunning ocean views. Known for fresh catches and innovative coastal cuisine.",
      cuisineType: "Seafood/American",
      restaurantSize: "Large (100+ seats)",
      description: "Award-winning restaurant featuring the freshest Pacific seafood with a modern twist. Perfect for special occasions."
    }
  },
  {
    email: "chef@greengarden.test",
    password: "testpassword123",
    role: UserRole.RESTAURANT,
    displayName: "Green Garden Cafe", 
    profileData: {
      restaurantName: "Green Garden Cafe",
      contactName: "Alex Thompson",
      firstName: "Alex",
      lastName: "Thompson", 
      phoneNumber: "(555) 777-8888",
      location: "Austin, TX",
      bio: "Farm-to-table cafe focusing on organic, locally-sourced ingredients. Casual dining with a commitment to sustainability.",
      cuisineType: "Farm-to-Table/American",
      restaurantSize: "Small (Under 50 seats)",
      description: "Cozy neighborhood cafe serving breakfast, lunch, and dinner made from ingredients sourced within 100 miles."
    }
  }
];

export class TestAccountSeeder {
  private static instance: TestAccountSeeder;

  public static getInstance(): TestAccountSeeder {
    if (!TestAccountSeeder.instance) {
      TestAccountSeeder.instance = new TestAccountSeeder();
    }
    return TestAccountSeeder.instance;
  }

  async createTestAccount(testAccount: TestAccount): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      console.log(`Creating test account: ${testAccount.email}`);
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        testAccount.email, 
        testAccount.password
      );

      const userId = userCredential.user.uid;

      // Create user profile
      const profileData: Partial<UserProfile> = {
        ...testAccount.profileData,
        role: testAccount.role,
        email: testAccount.email,
        displayName: testAccount.displayName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await profilesService.createUserProfile(userId, profileData);

      console.log(`✅ Successfully created test account: ${testAccount.email}`);
      return { 
        success: true, 
        message: `Test account created: ${testAccount.email}`,
        userId 
      };

    } catch (error: any) {
      console.error(`❌ Failed to create test account ${testAccount.email}:`, error);
      
      if (error.code === 'auth/email-already-in-use') {
        return { 
          success: false, 
          message: `Account ${testAccount.email} already exists` 
        };
      }
      
      return { 
        success: false, 
        message: `Failed to create ${testAccount.email}: ${error.message}` 
      };
    }
  }

  async createAllTestAccounts(): Promise<void> {
    console.log("🚀 Starting test account creation...");
    const results = [];

    for (const testAccount of TEST_ACCOUNTS) {
      const result = await this.createTestAccount(testAccount);
      results.push(result);
      
      // Add small delay between account creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("📊 Test Account Creation Summary:");
    results.forEach(result => {
      console.log(`  ${result.success ? '✅' : '❌'} ${result.message}`);
    });

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n🎯 Results: ${successful} successful, ${failed} failed`);
  }

  async createAccountsByRole(role: UserRole): Promise<void> {
    const accountsForRole = TEST_ACCOUNTS.filter(account => account.role === role);
    console.log(`🚀 Creating ${role} test accounts...`);

    for (const testAccount of accountsForRole) {
      await this.createTestAccount(testAccount);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  getTestCredentials(): { applicants: TestAccount[]; restaurants: TestAccount[] } {
    return {
      applicants: TEST_ACCOUNTS.filter(account => account.role === UserRole.APPLICANT),
      restaurants: TEST_ACCOUNTS.filter(account => account.role === UserRole.RESTAURANT)
    };
  }
}

export const testSeeder = TestAccountSeeder.getInstance();
