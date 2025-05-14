import { useState, useEffect } from 'react';
import { presenceService, UserPresence } from '@/services/presenceService';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Create a standalone hook that doesn't depend on UserContext
export function usePresence() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen for auth state changes directly instead of using UserContext
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Initialize presence tracking when the user is authenticated
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isAuthenticated && currentUser && !isInitialized) {
      try {
        cleanup = presenceService.initializePresence();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing presence:", error);
      }
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isAuthenticated, currentUser, isInitialized]);

  /**
   * Set the user's status
   * @param status - The user's status ('online', 'offline', 'away')
   */
  const setStatus = async (status: 'online' | 'offline' | 'away') => {
    if (!isAuthenticated || !currentUser) {
      console.warn('Cannot set status: User not authenticated');
      return;
    }

    try {
      await presenceService.setStatus(status);
    } catch (error) {
      console.error('Error setting status:', error);
    }
  };

  /**
   * Subscribe to a user's presence
   * @param userId - User ID
   * @param callback - Callback function to handle presence updates
   * @returns Unsubscribe function
   */
  const subscribeToUserPresence = (
    userId: string,
    callback: (presence: UserPresence | null) => void
  ): (() => void) => {
    return presenceService.subscribeToUserPresence(userId, callback);
  };

  /**
   * Get a hook for tracking a specific user's presence
   * @param userId - User ID to track
   * @returns Object with presence data and loading state
   */
  const useUserPresence = (userId: string | null | undefined) => { // Allow null or undefined
    const [presence, setPresence] = useState<UserPresence | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!userId) { // If no userId, set to offline/default and don't subscribe
        setPresence({ status: "offline", lastSeen: new Date() });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const unsubscribe = presenceService.subscribeToUserPresence(userId, (data) => {
        setPresence(data);
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }, [userId]);

    return { presence, isLoading, error };
  };

  /**
   * Get a hook for tracking multiple users' presence
   * @param userIds - Array of user IDs to track
   * @returns Object with presence map and loading state
   */
  const useMultipleUsersPresence = (userIds: (string | null | undefined)[]) => { // Allow null or undefined userIds
    const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const validUserIds = userIds.filter(id => typeof id === 'string') as string[];
      if (validUserIds.length === 0) {
        setPresenceMap({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const unsubscribe = presenceService.subscribeToMultipleUsersPresence(validUserIds, (data) => {
        setPresenceMap(data);
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }, [userIds]);

    return { presenceMap, isLoading, error };
  };

  /**
   * Get a hook for tracking online users
   * @returns Object with online users array and loading state
   */
  const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      const unsubscribe = presenceService.subscribeToOnlineUsers((users) => {
        setOnlineUsers(users);
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }, []);

    return { onlineUsers, loading };
  };

  return {
    isInitialized,
    setStatus,
    subscribeToUserPresence,
    useUserPresence,
    useMultipleUsersPresence,
    useOnlineUsers,
    currentUser,
    isAuthenticated
  };
}