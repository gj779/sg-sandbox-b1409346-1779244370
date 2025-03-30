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
  addDoc,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    
    // Build query
    let queryRef = query(collectionRef);
    
    // Add where conditions
    if (conditions && conditions.length > 0) {
      conditions.forEach(condition => {
        queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
      });
    }
    
    // Add orderBy
    if (orderByField) {
      queryRef = query(queryRef, orderBy(orderByField, orderDirection || 'asc'));
    }
    
    // Add limit
    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }
    
    // Add startAfter for pagination
    if (startAfterDoc) {
      queryRef = query(queryRef, startAfter(startAfterDoc));
    }
    
    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Get all documents in a collection
  async getAllDocuments(collectionName: string): Promise<DocumentData[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};