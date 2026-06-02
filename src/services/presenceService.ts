import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { realTimeDb, auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

// Define the user presence data type
export interface UserPresence {
  status: "online" | "offline" | "away";
  lastSeen: Date | null; // Corrected: Allow null and ensure single definition
  lastSeenTimestamp?: any; // For Firestore Server Timestamp
  userId?: string;
  displayName?: string; // Added
  photoURL?: string; // Added
}

// Collection path in the Realtime Database
const PRESENCE_REF = 'presence';
const USER_STATUS_REF = 'status';

export const presenceService = {
  /**
   * Initialize presence tracking for the current user
   * @returns Cleanup function
   */
  initializePresence(): () => void {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot initialize presence: No authenticated user');
      return () => {};
    }

    try {
      // Create references to the presence locations
      const userStatusRef = ref(realTimeDb, `${USER_STATUS_REF}/${user.uid}`);
      const presenceRef = ref(realTimeDb, `${PRESENCE_REF}/${user.uid}`);

      // Set up the presence data
      const presenceData: Omit<UserPresence, 'lastSeen'> & { lastSeenTimestamp: any } = {
        userId: user.uid,
        status: 'online',
        lastSeenTimestamp: serverTimestamp(),
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || "" // Ensure default empty string
      };

      // When the client's connection state changes, update the presence data
      const connectedRef = ref(realTimeDb, '.info/connected');
      
      // Store the onValue unsubscribe function
      const unsubscribe = onValue(connectedRef, (snapshot) => {
        // If we're connected (or reconnected)
        if (snapshot.val() === true) {
          console.log('Connected to Firebase Realtime Database');
          
          // Set presence data and remove it when disconnected
          const onDisconnectRef = onDisconnect(presenceRef);
          
          // When this client disconnects, update the presence data
          onDisconnectRef.set({
            ...presenceData,
            status: 'offline',
            lastSeenTimestamp: serverTimestamp()
          }).then(() => {
            // Now that we've set up the disconnect handler, set the presence data
            set(presenceRef, presenceData);
            
            // Also update the user status
            set(userStatusRef, {
              state: 'online',
              last_changed: serverTimestamp()
            });
          }).catch(error => {
            console.error('Error setting onDisconnect handler:', error);
          });
        } else {
          console.log('Disconnected from Firebase Realtime Database');
        }
      });

      // Return a cleanup function
      return () => {
        unsubscribe();
        // Set the user as offline when manually cleaning up
        set(presenceRef, {
          ...presenceData,
          status: 'offline',
          lastSeenTimestamp: serverTimestamp()
        }).catch(error => {
          console.error('Error updating presence on cleanup:', error);
        });
      };
    } catch (error) {
      console.error("Error in initializePresence:", error);
      return () => {};
    }
  },

  /**
   * Set the user's status
   * @param status - The user's status ('online', 'offline', 'away')
   */
  async setStatus(status: 'online' | 'offline' | 'away'): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot set status: No authenticated user');
      return;
    }

    const presenceRef = ref(realTimeDb, `${PRESENCE_REF}/${user.uid}`);
    
    try {
      await set(presenceRef, {
        userId: user.uid,
        status,
        lastSeenTimestamp: serverTimestamp(),
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || "" // Ensure default empty string
      });
    } catch (error) {
      console.error('Error setting user status:', error);
      throw new Error(`Failed to set user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Subscribe to a user's presence
   * @param userId - User ID
   * @param callback - Callback function to handle presence updates
   * @returns Unsubscribe function
   */
  subscribeToUserPresence(userId: string, callback: (presence: UserPresence | null) => void): () => void {
    try {
      const presenceRef = ref(realTimeDb, `${PRESENCE_REF}/${userId}`);
      
      return onValue(presenceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Convert server timestamp to Date
          const lastSeen = data.lastSeenTimestamp 
            ? (typeof data.lastSeenTimestamp === 'number' ? new Date(data.lastSeenTimestamp) : null)
            : null;
          
          callback({
            ...data,
            lastSeen,
            photoURL: data.photoURL || "" // Ensure default empty string for existing data
          });
        } else {
          callback(null);
        }
      }, (error) => {
        console.error(`Error in presence subscription for user ${userId}:`, error);
        callback(null);
      });
    } catch (error) {
      console.error(`Error setting up presence subscription for user ${userId}:`, error);
      return () => {};
    }
  },

  /**
   * Subscribe to presence updates for multiple users
   * @param userIds - Array of user IDs
   * @param callback - Callback function to handle presence updates
   * @returns Unsubscribe function
   */
  subscribeToMultipleUsersPresence(userIds: string[], callback: (presenceMap: Record<string, UserPresence>) => void): () => void {
    try {
      // Create a map to store unsubscribe functions for each user
      const unsubscribeFunctions: Record<string, () => void> = {};
      
      // Create a map to store presence data
      const presenceMap: Record<string, UserPresence> = {};
      
      // Subscribe to each user's presence
      userIds.forEach(userId => {
        unsubscribeFunctions[userId] = this.subscribeToUserPresence(userId, (presence) => {
          if (presence) {
            presenceMap[userId] = presence;
          } else {
            // If presence is null, set a default offline state
            presenceMap[userId] = {
              userId,
              status: 'offline',
              lastSeen: null, // Explicitly null
              photoURL: "" // Ensure default empty string
            };
          }
          
          // Call the callback with the updated map
          callback({ ...presenceMap });
        });
      });
      
      // Return a function to unsubscribe from all
      return () => {
        Object.values(unsubscribeFunctions).forEach(unsubscribe => unsubscribe());
      };
    } catch (error) {
      console.error("Error in subscribeToMultipleUsersPresence:", error);
      return () => {};
    }
  },

  /**
   * Get online users
   * @param callback - Callback function to handle online users
   * @returns Unsubscribe function
   */
  subscribeToOnlineUsers(callback: (users: UserPresence[]) => void): () => void {
    try {
      const presenceRef = ref(realTimeDb, PRESENCE_REF);
      
      return onValue(presenceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const onlineUsers: UserPresence[] = [];
          
          // Convert the object to an array and filter for online users
          Object.keys(data).forEach(userId => {
            const presence = data[userId];
            if (presence.status === 'online') {
              // Convert server timestamp to Date
              const lastSeen = presence.lastSeenTimestamp 
                ? (typeof presence.lastSeenTimestamp === 'number' ? new Date(presence.lastSeenTimestamp) : null)
                : null;
              
              onlineUsers.push({
                ...presence,
                userId,
                lastSeen,
                photoURL: presence.photoURL || "" // Ensure default empty string
              });
            }
          });
          
          callback(onlineUsers);
        } else {
          callback([]);
        }
      }, (error) => {
        console.error('Error in online users subscription:', error);
        callback([]);
      });
    } catch (error) {
      console.error("Error in subscribeToOnlineUsers:", error);
      return () => {};
    }
  }
};