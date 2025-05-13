import { useState, useEffect, useCallback } from 'react';
import { notificationsService, Notification } from '@/services/notificationsService';
import { useUser } from '@/contexts/UserContext';

export function useNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to notifications when the component mounts
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Subscribe to notifications
      const unsubscribeNotifications = notificationsService.subscribeToNotifications(
        user.uid,
        (notifications) => {
          setNotifications(notifications);
          setLoading(false);
        }
      );

      // Subscribe to unread count
      const unsubscribeUnreadCount = notificationsService.subscribeToUnreadCount(
        user.uid,
        (count) => {
          setUnreadCount(count);
        }
      );

      // Clean up subscriptions when the component unmounts
      return () => {
        unsubscribeNotifications();
        unsubscribeUnreadCount();
      };
    } catch (error) {
      console.error('Error setting up notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
      return () => {};
    }
  }, [user]);

  // Create a notification
  const createNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      return await notificationsService.createNotification(notificationData);
    } catch (error) {
      console.error('Error creating notification:', error);
      setError('Failed to create notification');
      throw error;
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await notificationsService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
      throw error;
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await notificationsService.markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
      throw error;
    }
  }, [user]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await notificationsService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
      throw error;
    }
  }, [user]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await notificationsService.deleteAllNotificationsForUser(user.uid);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      setError('Failed to delete all notifications');
      throw error;
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
}
