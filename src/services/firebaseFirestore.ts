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
  limit,
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
  async createDocument(collection: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collection), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },
  
  // Create a document with specified ID
  async createDocumentWithId(collectionName: string, id: string, data: any): Promise<void> {
    return setDoc(doc(db, collectionName, id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },
  
  // Get a document by ID
  async getDocument(collection: string, id: string): Promise<any> {
    try {
      const docRef = doc(db, collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log(`No document found with ID: ${id} in collection: ${collection}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  },
  
  // Update a document
  async updateDocument(collection: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collection, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  },
  
  // Delete a document
  async deleteDocument(collection: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
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
      let q = query(collection(db, collectionName));
      
      // Add conditions to query
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add ordering
      q = query(q, orderBy(orderByField, orderDirection));
      
      // Add limit
      q = query(q, limit(limitCount));
      
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
      const querySnapshot = await getDocs(collection(db, collectionName));
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