import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, secretKey } = req.body;

  if (!email || !password || !secretKey) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["email", "password", "secretKey"],
    });
  }

  // Verify secret key before allowing admin creation
  const expectedSecretKey = process.env.ADMIN_SECRET_KEY;
  if (!expectedSecretKey) {
    console.error("ADMIN_SECRET_KEY environment variable not set");
    return res.status(500).json({ 
      error: "Server configuration error. Admin setup is not available." 
    });
  }
  
  if (secretKey !== expectedSecretKey) {
    return res.status(403).json({ 
      error: "Invalid secret key. Unauthorized access attempt logged." 
    });
  }

  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      return res.status(503).json({ error: "Firebase Admin is not initialized" });
    }

    // Check if user already exists
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      
      // If user exists, make them an admin
      await adminDb.collection("users").doc(userRecord.uid).set({
        email: userRecord.email,
        userType: "admin",
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Set custom claims
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        admin: true,
      });

      return res.status(200).json({
        success: true,
        message: "Existing user updated with admin privileges",
        userId: userRecord.uid,
      });
    } catch (error) {
      // User doesn't exist, create new admin user
      // Double-check Firebase Admin is still initialized
      if (!adminAuth || !adminDb) {
        return res.status(503).json({ error: "Firebase Admin is not initialized" });
      }

      const userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: true,
      });

      // Create user document in Firestore
      await adminDb.collection("users").doc(userRecord.uid).set({
        email: userRecord.email,
        userType: "admin",
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Set custom claims
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        admin: true,
      });

      return res.status(201).json({
        success: true,
        message: "Admin user created successfully",
        userId: userRecord.uid,
      });
    }
  } catch (error) {
    console.error("Error setting up admin credentials:", error);
    return res.status(500).json({
      error: "Failed to set up admin credentials",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}