
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { db as clientDb } from "@/lib/firebase";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
    process.env.FIREBASE_ADMIN_CREDENTIAL || 
    '{}'
  );

  initializeApp({
    credential: cert(serviceAccount)
  });
}

// Get Firestore instance from Admin SDK
const adminDb = getFirestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { secretKey } = req.body;
    // Hardcoded email for the owner admin account
    const ownerEmail = "staffspce@gmail.com";

    // Validate inputs
    if (!secretKey) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required secret key" 
      });
    }

    // Check the secret key (this is a simple security measure)
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || "staffspace-owner-key";
    if (secretKey !== expectedSecretKey) {
      return res.status(403).json({ 
        success: false,
        message: "Invalid secret key" 
      });
    }

    // Find the user with the owner email using client SDK
    const usersRef = collection(clientDb, "users");
    const q = query(usersRef, where("email", "==", ownerEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: `User with email ${ownerEmail} not found. Please register this email first.` 
      });
    }

    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Update the user's profile in Firestore using Admin SDK
    // This bypasses security rules
    await adminDb.collection("users").doc(userId).update({
      userType: "admin",
      updatedAt: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      message: `User ${ownerEmail} has been successfully made an admin`,
      userId: userId
    });
  } catch (error) {
    console.error("Error making staffspace admin:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to make staffspace an admin", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
