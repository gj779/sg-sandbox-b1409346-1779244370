import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { realTimeDb, auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

// Define the user presence data type
export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastActive: Date | null;
  displayName?: string;
  photoURL?: string;
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

    // Create references to the presence locations
    const userStatusRef = ref(realTimeDb, `${USER_STATUS_REF}/${user.uid}`);
    const presenceRef = ref(realTimeDb, `${PRESENCE_REF}/${user.uid}`);

    // Set up the presence data
    const presenceData: UserPresence = {
      userId: user.uid,
      status: 'online',
      lastActive: new Date(),
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined
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
          lastActive: serverTimestamp()
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
        lastActive: serverTimestamp()
      }).catch(error => {
        console.error('Error updating presence on cleanup:', error);
      });
    };
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
        lastActive: serverTimestamp(),
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined
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
    const presenceRef = ref(realTimeDb, `${PRESENCE_REF}/${userId}`);
    
    return onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Convert server timestamp to Date if needed
        const lastActive = data.lastActive ? new Date(data.lastActive) : null;
        
        callback({
          ...data,
          lastActive
        });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in presence subscription for user ${userId}:`, error);
      callback(null);
    });
  },

  /**
   * Subscribe to presence updates for multiple users
   * @param userIds - Array of user IDs
   * @param callback - Callback function to handle presence updates
   * @returns Unsubscribe function
   */
  subscribeToMultipleUsersPresence(userIds: string[], callback: (presenceMap: Record<string, UserPresence>) => void): () => void {
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
            lastActive: null
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
  },

  /**
   * Get online users
   * @param callback - Callback function to handle online users
   * @returns Unsubscribe function
   */
  subscribeToOnlineUsers(callback: (users: UserPresence[]) => void): () => void {
    const presenceRef = ref(realTimeDb, PRESENCE_REF);
    
    return onValue(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const onlineUsers: UserPresence[] = [];
        
        // Convert the object to an array and filter for online users
        Object.keys(data).forEach(userId => {
          const presence = data[userId];
          if (presence.status === 'online') {
            // Convert server timestamp to Date if needed
            const lastActive = presence.lastActive ? new Date(presence.lastActive) : null;
            
            onlineUsers.push({
              ...presence,
              userId,
              lastActive
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
  }
};
