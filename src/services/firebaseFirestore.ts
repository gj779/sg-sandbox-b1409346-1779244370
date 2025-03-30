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
  // Create a document with auto-generated ID
  async createDocument(collectionName: string, data: any): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
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
  async getDocument(collectionName: string, id: string): Promise<DocumentData | null> {
    const docSnap = await getDoc(doc(db, collectionName, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  
  // Update a document
  async updateDocument(collectionName: string, id: string, updates: any): Promise<void> {
    return updateDoc(doc(db, collectionName, id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },
  
  // Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    return deleteDoc(doc(db, collectionName, id));
  },
  
  // Query documents
  async queryDocuments(
    collectionName: string,
    conditions: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<DocumentData[]> {
    const collectionRef = collection(db, collectionName);
    
    // Build the query
    let queryConstraints = [];
    
    // Add where conditions
    if (conditions && conditions.length > 0) {
      for (const condition of conditions) {
        queryConstraints.push(where(condition.field, condition.operator, condition.value));
      }
    }
    
    // Add orderBy
    if (orderByField) {
      queryConstraints.push(orderBy(orderByField, orderDirection || 'asc'));
    }
    
    // Add limit
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }
    
    // Add startAfter for pagination
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
    
    // Create the query
    const q = query(collectionRef, ...queryConstraints);
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Get all documents in a collection
  async getAllDocuments(collectionName: string): Promise<DocumentData[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};