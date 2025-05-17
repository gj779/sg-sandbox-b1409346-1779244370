
import { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebase-admin";

// This is a special endpoint for setting up admin credentials
// It should be disabled or protected in production environments
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract email and password from request body
    const { email, password, adminKey } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Simple security check - require an admin key
    // In production, you would use a more secure method
    // This is just for initial setup purposes
    const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || "staffspace-admin-setup-2025";
    
    if (adminKey !== ADMIN_SETUP_KEY) {
      return res.status(403).json({ error: "Invalid admin setup key" });
    }

    // Check if user already exists
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // If user exists, make them an admin
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        email: email,
        userType: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      return res.status(200).json({ 
        message: "Existing user updated with admin privileges",
        uid: userRecord.uid
      });
    } catch (error) {
      // User doesn't exist, create new user
      const userRecord = await admin.auth().createUser({
        email,
        password,
        emailVerified: true,
      });

      // Store user data in Firestore with admin role
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        email: email,
        userType: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return res.status(201).json({ 
        message: "Admin user created successfully",
        uid: userRecord.uid
      });
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({ error: "Failed to create admin user" });
  }
}
