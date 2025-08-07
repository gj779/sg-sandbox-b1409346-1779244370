
import * as admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin if it hasn't been initialized yet
if (!getApps().length) {
  let serviceAccount;
  try {
    // Try to parse the service account from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "");
  } catch {
    // If parsing fails, try to load from local file
    serviceAccount = require("../../firebase-service-account.json");
  }

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

// Export the admin instance and commonly used services
export const firebaseAdmin = admin;
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Helper functions for common admin operations
export const verifyIdToken = async (token: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

export const setCustomUserClaims = async (uid: string, claims: object) => {
  try {
    await adminAuth.setCustomUserClaims(uid, claims);
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw error;
  }
};

export const createUser = async (userData: admin.auth.CreateRequest) => {
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