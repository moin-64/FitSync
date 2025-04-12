
import React, { useState } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FriendRequest, Notification } from '@/types/user';
import FriendRequests from '@/components/profile/FriendRequests';
import NotificationsList from '@/components/notifications/NotificationsList';

interface NotificationsCenterProps {
  friendRequests: FriendRequest[];
  notifications: Notification[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onClearNotification: (notificationId: string) => void;
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  friendRequests,
  notifications,
  onAcceptRequest,
  onDeclineRequest,
  onMarkNotificationAsRead,
  onClearNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  const hasNotifications = notifications.some(n => !n.read);
  const hasFriendRequests = friendRequests.length > 0;
  const unreadCount = notifications.filter(n => !n.read).length + friendRequests.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                variant="destructive"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="notifications" className="relative">
              Benachrichtigungen
              {hasNotifications && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Anfragen
              {hasFriendRequests && (
                <Badge variant="destructive" className="ml-2">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="max-h-[300px] overflow-y-auto">
            <NotificationsList
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onClear={onClearNotification}
              onAcceptRequest={onAcceptRequest}  
              onDeclineRequest={onDeclineRequest}
            />
          </TabsContent>
          
          <TabsContent value="requests" className="max-h-[300px] overflow-y-auto">
            <FriendRequests
              requests={friendRequests}
              onAccept={onAcceptRequest}
              onDecline={onDeclineRequest}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsCenter;
