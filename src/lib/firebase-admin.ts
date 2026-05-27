import * as admin from "firebase-admin";
import { getApps, initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { env } from "@/env";

// Initialize Firebase Admin if it hasn't been initialized yet
if (!getApps().length) {
  let serviceAccount: ServiceAccount | undefined;
  
  try {
    // Try to parse the service account from environment variable
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      serviceAccount = JSON.parse(serviceAccountKey);
    }
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
  }

  // If no service account from env, construct from individual env vars
  if (!serviceAccount) {
    serviceAccount = {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  // Only initialize if we have valid credentials
  if (serviceAccount) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
    }
  }
}

// Export the admin instance and commonly used services
export const firebaseAdmin = admin;
export const adminAuth = getApps().length > 0 ? getAuth() : null;
export const adminDb = getApps().length > 0 ? getFirestore() : null;
export const adminStorage = getApps().length > 0 ? getStorage() : null;

// Helper functions for common admin operations
export const verifyIdToken = async (token: string) => {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not initialized");
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not initialized");
  }
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

export const setCustomUserClaims = async (uid: string, claims: object) => {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not initialized");
  }
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw error;
  }
};

export const createUser = async (userData: admin.auth.CreateRequest) => {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not initialized");
  }
  try {
    const userRecord = await adminAuth.createUser(userData);
    return userRecord;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Create a named constant for the default export to fix lint warning
const firebaseAdminUtils = {
  firebaseAdmin,
  adminAuth,
  adminDb,
  adminStorage,
  verifyIdToken,
  getUserByEmail,
  setCustomUserClaims,
  createUser,
};

export default firebaseAdminUtils;