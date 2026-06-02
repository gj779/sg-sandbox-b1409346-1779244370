import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

// Define the Notification schema for validation
export const notificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  type: z.enum([
    "message", 
    "application", 
    "job_update", 
    "interview", 
    "system", 
    "mention"
  ]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  isRead: z.boolean().default(false),
  data: z.record(z.string(), z.any()).optional(),
  createdAt: z.preprocess((val) => (val instanceof Timestamp ? val.toDate() : val), z.date().optional()),
  expiresAt: z.preprocess((val) => (val instanceof Timestamp ? val.toDate() : val), z.date().optional())
});

// Define the Notification type
export type Notification = z.infer<typeof notificationSchema>;

// Collection path
const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationsService = {
  /**
   * Create a new notification
   * @param notificationData - Notification data
   * @returns Promise with the created notification
   */
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<{ id: string; data: Notification }> {
    try {
      // Validate notification data
      const validatedData = notificationSchema.parse(notificationData);
      
      // Add timestamps
      const dataWithTimestamps = {
        ...validatedData,
        createdAt: serverTimestamp(),
        isRead: false
      };
      
      // Add document to collection
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), dataWithTimestamps);
      
      return { 
        id: docRef.id, 
        data: { ...validatedData, id: docRef.id } as Notification 
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get a notification by ID
   * @param notificationId - Notification ID
   * @returns Promise with the notification data
   */
  async getNotificationById(notificationId: string): Promise<Notification | null> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert Firestore Timestamps to JavaScript Dates
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt;
          
        const expiresAt = data.expiresAt instanceof Timestamp 
          ? data.expiresAt.toDate() 
          : data.expiresAt;
        
        return { 
          id: docSnap.id, 
          ...data,
          createdAt,
          expiresAt
        } as Notification;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting notification ${notificationId}:`, error);
      throw new Error(`Failed to get notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get notifications for a user
   * @param userId - User ID
   * @param limit - Number of notifications to fetch
   * @returns Promise with an array of notifications
   */
  async getNotificationsForUser(userId: string, limitCount: number = 20): Promise<Notification[]> {
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ];
      
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore Timestamps to JavaScript Dates
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt;
          
        const expiresAt = data.expiresAt instanceof Timestamp 
          ? data.expiresAt.toDate() 
          : data.expiresAt;
        
        return { 
          id: doc.id, 
          ...data,
          createdAt,
          expiresAt
        } as Notification;
      });
    } catch (error) {
      console.error(`Error getting notifications for user ${userId}:`, error);
      throw new Error(`Failed to get notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get unread notifications count for a user
   * @param userId - User ID
   * @returns Promise with the count of unread notifications
   */
  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        where('isRead', '==', false)
      ];
      
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.size;
    } catch (error) {
      console.error(`Error getting unread notifications count for user ${userId}:`, error);
      throw new Error(`Failed to get unread notifications count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @returns Promise<void>
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Promise<void>
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        where('isRead', '==', false)
      ];
      
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      // Update each notification
      const promises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error);
      throw new Error(`Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete a notification
   * @param notificationId - Notification ID
   * @returns Promise<void>
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete all notifications for a user
   * @param userId - User ID
   * @returns Promise<void>
   */
  async deleteAllNotificationsForUser(userId: string): Promise<void> {
    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId)
      ];
      
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      
      // Delete each notification
      const promises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error(`Error deleting all notifications for user ${userId}:`, error);
      throw new Error(`Failed to delete all notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Subscribe to notifications for a user
   * @param userId - User ID
   * @param callback - Callback function to handle notifications
   * @returns Unsubscribe function
   */
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    ];
    
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore Timestamps to JavaScript Dates
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt;
          
        const expiresAt = data.expiresAt instanceof Timestamp 
          ? data.expiresAt.toDate() 
          : data.expiresAt;
        
        return { 
          id: doc.id, 
          ...data,
          createdAt,
          expiresAt
        } as Notification;
      });
      
      callback(notifications);
    }, (error) => {
      console.error(`Error in notifications subscription for user ${userId}:`, error);
      callback([]);
    });
  },

  /**
   * Subscribe to unread notifications count for a user
   * @param userId - User ID
   * @param callback - Callback function to handle unread count
   * @returns Unsubscribe function
   */
  subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('isRead', '==', false)
    ];
    
    const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      callback(querySnapshot.size);
    }, (error) => {
      console.error(`Error in unread count subscription for user ${userId}:`, error);
      callback(0);
    });
  }
};
