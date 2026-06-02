import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { firebaseMessagingService } from "@/services/firebaseMessaging";
import { applicationsService } from "@/services/applicationsService";
import { useRouter } from "next/router";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "message" | "application" | "job" | "system";
  read: boolean;
  timestamp: any;
  link?: string;
}

export default function NotificationBell() {
  const { userProfile } = useFirebaseAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userProfile || !userProfile.id) return;

    const fetchNotifications = async () => {
      try {
        // Get unread message count
        const messageCount = await firebaseMessagingService.getUnreadMessageCount(userProfile.id as string);
        
        // Get recent applications (for restaurants) or application status updates (for applicants)
        let applicationNotifications: Notification[] = [];
        
        if (userProfile.userType === "restaurant") {
          const applications = await applicationsService.getApplicationsByRestaurantId(userProfile.id as string);
          // Only get recent applications (last 7 days)
          const recentApplications = applications.filter(app => {
            // Handle the appliedAt date properly
            let appDate: Date;
            
            // First check if appliedAt exists
            if (!app.createdAt) {
              return false;
            }
            
            // Then handle different types of date values
            if (typeof app.createdAt === 'object' && app.createdAt !== null) {
              // Check if it's a Firebase timestamp with toDate method
              if ('toDate' in app.createdAt && typeof app.createdAt.toDate === 'function') {
                appDate = app.createdAt.toDate();
              } else if (app.createdAt instanceof Date) {
                // It's already a Date object
                appDate = app.createdAt;
              } else {
                // Try to convert to Date
                appDate = new Date(app.createdAt);
              }
            } else {
              // It's a string or number, convert to Date
              appDate = new Date(app.createdAt);
            }
            
            // Check if the date is valid
            if (isNaN(appDate.getTime())) {
              return false;
            }
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return appDate > sevenDaysAgo;
          });
          
          applicationNotifications = recentApplications.map(app => ({
            id: app.id || '',
            title: "New Application",
            message: `You have a new application for job ID: ${app.jobId}`,
            type: "application",
            read: false,
            timestamp: app.createdAt,
            link: `/restaurant/applications/${app.id}`
          }));
        } else if (userProfile.userType === "applicant") {
          const applications = await applicationsService.getApplicationsByApplicantId(userProfile.id as string);
          // Only get applications with status updates
          const updatedApplications = applications.filter(app => 
            app.status.toLowerCase() !== "pending" && 
            app.updatedAt !== app.createdAt
          );
          
          applicationNotifications = updatedApplications.map(app => ({
            id: app.id || '',
            title: `Application ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`,
            message: `Your application status has been updated to: ${app.status}`,
            type: "application",
            read: false,
            timestamp: app.updatedAt,
            link: `/applicant/applications/${app.id}`
          }));
        }
        
        // Create message notifications
        const messageNotifications: Notification[] = Array(messageCount).fill({
          id: `message-${Date.now()}`,
          title: "New Message",
          message: "You have a new unread message",
          type: "message",
          read: false,
          timestamp: new Date(),
          link: "/messaging"
        });
        
        // Combine all notifications
        const allNotifications = [...applicationNotifications, ...messageNotifications];
        
        // Sort by timestamp (newest first)
        const sorted = [...allNotifications].sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || 0;
          const timeB = b.timestamp?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setNotifications(sorted);
        setUnreadCount(sorted.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    
    // Set up a polling interval to check for new notifications
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [userProfile]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Navigate to the link if provided
    if (notification.link) {
      router.push(notification.link);
    }
    
    // Close the popover
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    
    // Handle Firebase timestamps or Date objects
    let date: Date;
    
    if (typeof timestamp === 'object' && timestamp !== null) {
      // Check if it's a Firebase timestamp with toDate method
      if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        // It's already a Date object
        date = timestamp;
      } else {
        // Try to convert to Date
        date = new Date(timestamp);
      }
    } else {
      // It's a string or number, convert to Date
      date = new Date(timestamp);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Unknown time";
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!userProfile) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${notification.read ? 'opacity-70' : 'bg-muted/20'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}