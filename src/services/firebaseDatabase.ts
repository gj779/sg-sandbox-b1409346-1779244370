import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  DocumentData,
  QueryConstraint,
  QuerySnapshot,
  writeBatch // Import writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generic database service for CRUD operations
export const firebaseDatabaseService = {
  /**
   * Create a document with a generated ID
   * @param collectionPath - Path to the collection
   * @param data - Data to be stored
   * @returns Promise with the document reference
   */
  async create<T extends DocumentData>(collectionPath: string, data: T): Promise<{ id: string; data: T }> {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add document to collection with auto-generated ID
      const docRef = await addDoc(collection(db, collectionPath), dataWithTimestamps);
      
      return { 
        id: docRef.id, 
        data: { ...data, id: docRef.id } as T 
      };
    } catch (error) {
      console.error(`Error creating document in ${collectionPath}:`, error);
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Create a document with a specific ID
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @param data - Data to be stored
   * @returns Promise with the document reference
   */
  async createWithId<T extends DocumentData>(collectionPath: string, id: string, data: T): Promise<{ id: string; data: T }> {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add document to collection with specified ID
      const docRef = doc(db, collectionPath, id);
      await setDoc(docRef, dataWithTimestamps);
      
      return { 
        id, 
        data: { ...data, id } as T 
      };
    } catch (error) {
      console.error(`Error creating document with ID ${id} in ${collectionPath}:`, error);
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Read a document by ID
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @returns Promise with the document data
   */
  async getById<T>(collectionPath: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert Firestore Timestamps to JavaScript Dates
        const processedData = this.processTimestamps(data);
        
        return { 
          id: docSnap.id, 
          ...processedData 
        } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionPath}:`, error);
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Query documents from a collection
   * @param collectionPath - Path to the collection
   * @param constraints - Query constraints (where, orderBy, limit, etc.)
   * @returns Promise with an array of documents
   */
  async query<T>(collectionPath: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionPath);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const processedData = this.processTimestamps(data);
        
        return { 
          id: doc.id, 
          ...processedData 
        } as T;
      });
    } catch (error) {
      console.error(`Error querying collection ${collectionPath}:`, error);
      throw new Error(`Failed to query collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Update a document
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @param data - Data to update
   * @returns Promise with the updated document
   */
  async update<T extends DocumentData>(collectionPath: string, id: string, data: Partial<T>): Promise<{ id: string; data: Partial<T> }> {
    try {
      const docRef = doc(db, collectionPath, id);
      
      // Add updatedAt timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, dataWithTimestamp);
      
      return { 
        id, 
        data: { ...data, id } as Partial<T> 
      };
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionPath}:`, error);
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete a document
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @returns Promise<void>
   */
  async delete(collectionPath: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionPath}:`, error);
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Subscribe to real-time updates for a document
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToDocument<T>(
    collectionPath: string, 
    id: string, 
    callback: (data: T | null) => void
  ): () => void {
    const docRef = doc(db, collectionPath, id);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const processedData = this.processTimestamps(data);
        
        callback({ 
          id: docSnap.id, 
          ...processedData 
        } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in document subscription for ${id} in ${collectionPath}:`, error);
      callback(null);
    });
  },

  /**
   * Subscribe to real-time updates for a query
   * @param collectionPath - Path to the collection
   * @param constraints - Query constraints
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToQuery<T>(
    collectionPath: string, 
    constraints: QueryConstraint[] = [], 
    callback: (data: T[]) => void
  ): () => void {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const processedData = this.processTimestamps(data);
        
        return { 
          id: doc.id, 
          ...processedData 
        } as T;
      });
      
      callback(documents);
    }, (error) => {
      console.error(`Error in query subscription for ${collectionPath}:`, error);
      callback([]);
    });
  },

  /**
   * Process Firestore timestamps to JavaScript Dates
   * @param data - Document data
   * @returns Processed data with timestamps converted to Dates
   */
  processTimestamps(data: DocumentData): DocumentData {
    const processedData = { ...data };
    
    for (const key in processedData) {
      if (processedData[key] instanceof Timestamp) {
        processedData[key] = processedData[key].toDate();
      } else if (typeof processedData[key] === 'object' && processedData[key] !== null) {
        processedData[key] = this.processTimestamps(processedData[key]);
      }
    }
    
    return processedData;
  },

  /**
   * Get a document reference
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @returns Document reference
   */
  getDocRef(collectionPath: string, id: string): DocumentReference {
    return doc(db, collectionPath, id);
  },

  /**
   * Check if a document exists
   * @param collectionPath - Path to the collection
   * @param id - Document ID
   * @returns Promise<boolean>
   */
  async exists(collectionPath: string, id: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking if document ${id} exists in ${collectionPath}:`, error);
      throw new Error(`Failed to check document existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Batch create, update, or delete multiple documents
   * @param operations - Array of operations
   * @returns Promise<void>
   */
  async batchOperation(operations: {
    type: 'create' | 'update' | 'delete';
    collectionPath: string;
    id: string;
    data?: DocumentData;
  }[]): Promise<void> {
    try {
      const batch = writeBatch(db); // Corrected: use writeBatch(db)
      
      for (const operation of operations) {
        const docRef = doc(db, operation.collectionPath, operation.id);
        
        if (operation.type === 'create' && operation.data) {
          const dataWithTimestamps = {
            ...operation.data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(docRef, dataWithTimestamps);
        } else if (operation.type === 'update' && operation.data) {
          const dataWithTimestamp = {
            ...operation.data,
            updatedAt: serverTimestamp()
          };
          batch.update(docRef, dataWithTimestamp);
        } else if (operation.type === 'delete') {
          batch.delete(docRef);
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error in batch operation:', error);
      throw new Error(`Failed to perform batch operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};