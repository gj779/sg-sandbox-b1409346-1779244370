import { NextApiRequest, NextApiResponse } from "next";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the request contains the required data
  const { ownerEmail } = req.body;

  if (!ownerEmail) {
    return res.status(400).json({
      error: "Missing required fields",
      requiredFields: ["ownerEmail"],
    });
  }

  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      return res.status(503).json({ error: "Firebase Admin is not initialized" });
    }

    // Use the admin SDK to find the user
    console.log("Looking for user with email:", ownerEmail);
    
    const userRecord = await adminAuth.getUserByEmail(ownerEmail);
    if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }

    // Set custom claims for the user
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      staffspaceAdmin: true,
    });

    // Update the user's profile in Firestore
    await adminDb.collection("users").doc(userRecord.uid).update({
      userType: "admin",
      isStaffspaceAdmin: true,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      message: "Successfully set user as StaffSpace admin",
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error("Error setting StaffSpace admin:", error);
    return res.status(500).json({
      error: "Failed to set StaffSpace admin",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
