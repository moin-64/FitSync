
import { useState, useCallback } from 'react';
import { UserProfile, Notification } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { saveToStorage } from '@/utils/localStorage';

export function useNotifications(
  profile: UserProfile,
  updateProfileFn: (data: Partial<UserProfile>) => Promise<void>
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get all notifications
  const getNotifications = useCallback((): Notification[] => {
    return Array.isArray(profile.notifications) ? profile.notifications : [];
  }, [profile.notifications]);

  // Get unread notifications count
  const getUnreadCount = useCallback((): number => {
    const notifications = getNotifications();
    return notifications.filter(notif => !notif.read).length;
  }, [getNotifications]);
  
  // Add a notification
  const addNotification = useCallback((notification: Notification): Notification[] => {
    try {
      const existingNotifications = getNotifications();
      const updatedNotifications = [notification, ...existingNotifications];
      
      // Save to localStorage for better persistence
      saveToStorage('notifications', updatedNotifications);
      
      return updatedNotifications;
    } catch (error) {
      console.error('Failed to add notification:', error);
      return getNotifications();
    }
  }, [getNotifications]);

  // Mark a notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const notifications = getNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      await updateProfileFn({
        notifications: updatedNotifications
      });
      
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Fehler',
        description: 'Benachrichtigung konnte nicht als gelesen markiert werden',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getNotifications, updateProfileFn, toast]);

  // Clear notification
  const clearNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const notifications = getNotifications();
      const updatedNotifications = notifications.filter(notification => 
        notification.id !== notificationId
      );
      
      await updateProfileFn({
        notifications: updatedNotifications
      });
      
      return true;
    } catch (error) {
      console.error('Failed to clear notification:', error);
      toast({
        title: 'Fehler',
        description: 'Benachrichtigung konnte nicht entfernt werden',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getNotifications, updateProfileFn, toast]);

  return {
    isLoading,
    getNotifications,
    getUnreadCount,
    addNotification,
    markNotificationAsRead,
    clearNotification
  };
}
