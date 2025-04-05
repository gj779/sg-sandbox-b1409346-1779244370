
import admin from "@/lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      message: "Method not allowed" 
    });
  }

  try {
    const { secretKey } = req.body;
    // Use the correct email for the owner admin account
    const ownerEmail = "staffspce@gmail.com";
    const defaultPassword = "StaffSpace@Admin2025"; // Default password for initial setup

    // Validate inputs
    if (!secretKey) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required secret key" 
      });
    }

    // Check the secret key (this is a simple security measure)
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || "staffspace-owner-key";
    
    // Remove any quotes that might be in the secret key
    // Handle both string and JSON string formats
    let cleanSecretKey = secretKey;
    if (typeof secretKey === "string") {
      cleanSecretKey = secretKey.replace(/^["'](.*)["']$/, "$1");
      cleanSecretKey = cleanSecretKey.trim();
    }
    
    console.log("Received secret key:", secretKey);
    console.log("Cleaned secret key:", cleanSecretKey);
    console.log("Expected secret key:", expectedSecretKey);
    
    if (cleanSecretKey !== expectedSecretKey) {
      return res.status(403).json({ 
        success: false,
        message: "Invalid secret key" 
      });
    }

    try {
      // Use the admin SDK to find the user
      const adminDb = admin.firestore();
      const adminAuth = admin.auth();
      
      console.log("Looking for user with email:", ownerEmail);
      
      const usersSnapshot = await adminDb
        .collection("users")
        .where("email", "==", ownerEmail)
        .get();

      let userId;

      // If user doesn't exist in Firestore, create the user
      if (usersSnapshot.empty) {
        console.log("User not found with email:", ownerEmail);
        console.log("Creating new admin user...");
        
        try {
          // Check if user exists in Firebase Auth
          let userRecord;
          try {
            userRecord = await adminAuth.getUserByEmail(ownerEmail);
            userId = userRecord.uid;
            console.log("User exists in Auth but not in Firestore, using existing auth user:", userId);
          } catch (authError) {
            // User doesn't exist in Auth, create new user
            console.log("User doesn't exist in Auth, creating new user");
            userRecord = await adminAuth.createUser({
              email: ownerEmail,
              password: defaultPassword,
              displayName: "StaffSpace Admin",
              emailVerified: true
            });
            userId = userRecord.uid;
            console.log("Created new auth user:", userId);
          }
          
          // Create user profile in Firestore
          const userProfile = {
            id: userId,
            email: ownerEmail,
            userType: "admin",
            firstName: "StaffSpace",
            lastName: "Admin",
            phoneNumber: "",
            isAdmin: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          };
          
          await adminDb.collection("users").doc(userId).set(userProfile);
          console.log("Created new admin user profile in Firestore");
          
          return res.status(200).json({ 
            success: true, 
            message: `Admin user ${ownerEmail} has been successfully created`,
            userId: userId,
            isNewUser: true
          });
        } catch (createError) {
          console.error("Error creating admin user:", createError);
          return res.status(500).json({ 
            success: false, 
            message: "Failed to create admin user", 
            error: createError instanceof Error ? createError.message : String(createError) 
          });
        }
      } else {
        // User exists, update to admin
        const userDoc = usersSnapshot.docs[0];
        userId = userDoc.id;
        
        console.log("Found user with ID:", userId);
        console.log("Current user data:", userDoc.data());

        // Update the user's profile in Firestore using Admin SDK
        await adminDb.collection("users").doc(userId).update({
          userType: "admin",
          isAdmin: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("Successfully updated user to admin");

        return res.status(200).json({ 
          success: true, 
          message: `User ${ownerEmail} has been successfully made an admin`,
          userId: userId,
          isNewUser: false
        });
      }
    } catch (adminError) {
      console.error("Admin SDK error:", adminError);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to make staffspce an admin", 
        error: adminError instanceof Error ? adminError.message : String(adminError) 
      });
    }
  } catch (error) {
    console.error("Error making staffspce admin:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to make staffspce an admin", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
