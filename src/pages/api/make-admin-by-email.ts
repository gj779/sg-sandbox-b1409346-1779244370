import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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
    const { email, secretKey } = req.body;

    // Validate inputs
    if (!email || !secretKey) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Check the secret key (this is a simple security measure)
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY;
    if (!expectedSecretKey) {
      console.error("ADMIN_SECRET_KEY environment variable not set");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error. Admin functionality is not available." 
      });
    }
    if (secretKey !== expectedSecretKey) {
      return res.status(403).json({ message: "Invalid secret key" });
    }

    // Find the user with the provided email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: `User with email ${email} not found. Please ensure the user is registered first.` 
      });
    }

    // Get the user document
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Update the user's profile in Firestore to make them an admin
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      userType: "admin",
      updatedAt: serverTimestamp()
    });

    return res.status(200).json({ 
      success: true, 
      message: `User ${email} has been successfully made an admin`,
      userId: userId
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