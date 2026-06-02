import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
  status: "new" | "read" | "responded";
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export async function saveContactMessage(messageData: Omit<ContactMessage, "id" | "createdAt" | "status">) {
  try {
    const docRef = await addDoc(collection(db, "contactMessages"), {
      ...messageData,
      status: "new",
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving contact message:", error);
    throw error;
  }
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactMessage[];
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    throw error;
  }
}

export async function updateMessageStatus(messageId: string, status: "new" | "read" | "responded") {
  try {
    const messageRef = doc(db, "contactMessages", messageId);
    await updateDoc(messageRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
}