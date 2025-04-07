import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as limitTo,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  addDoc,
  WhereFilterOp,
  CollectionReference
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Generic Firestore service
export const firestoreService = {
  // Create a document
  async createDocument(collectionName: string, data: any): Promise<string> {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  },
  
  // Create a document with specified ID
  async createDocumentWithId(collectionName: string, id: string, data: any): Promise<void> {
    try {
      return setDoc(doc(db, collectionName, id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error creating document with ID in ${collectionName}:`, error);
      throw error;
    }
  },
  
  // Get a document by ID
  async getDocument(collectionName: string, id: string): Promise<any> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log(`No document found with ID: ${id} in collection: ${collectionName}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },
  
  // Update a document
  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },
  
  // Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },
  
  // Query documents
  async queryDocuments(
    collectionName: string,
    conditions: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    orderByField: string = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount: number = 50
  ): Promise<any[]> {
    try {
      const collectionRef = collection(db, collectionName);
      let q = query(collectionRef);
      
      // Add conditions to query
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }
      
      // Add ordering
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Add limit
      q = query(q, limitTo(limitCount));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying documents from ${collectionName}:`, error);
      // Instead of throwing, return an empty array to prevent cascading failures
      return [];
    }
  },
  
  // Get all documents in a collection
  async getAllDocuments(collectionName: string): Promise<any[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting all documents from ${collectionName}:`, error);
      // Instead of throwing, return an empty array to prevent cascading failures
      return [];
    }
  }
};