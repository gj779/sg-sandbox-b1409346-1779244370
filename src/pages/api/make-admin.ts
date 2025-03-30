
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, secretKey } = req.body;

    // Validate inputs
    if (!userId || !secretKey) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check the secret key (this is a simple security measure)
    // In production, you would use a more secure approach
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || "staffspace-owner-key";
    if (secretKey !== expectedSecretKey) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    // Update the user's profile in Firestore to make them an admin
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      userType: "admin",
      updatedAt: new Date()
    });

    return res.status(200).json({ 
      success: true, 
      message: "User has been successfully made an admin" 
    });
  } catch (error) {
    console.error("Error making user admin:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to make user an admin", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
