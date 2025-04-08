
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import NotificationsCenter from '@/components/notifications/NotificationsCenter';
import { FriendRequest, Notification } from '@/types/user';

interface ProfileHeaderProps {
  onSave: () => void;
  friendRequests: FriendRequest[];
  notifications: Notification[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onShowFriendSearch: () => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onClearNotification: (notificationId: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  onSave, 
  friendRequests, 
  notifications,
  onAcceptRequest, 
  onDeclineRequest,
  onShowFriendSearch,
  onMarkNotificationAsRead,
  onClearNotification
}) => {
  return (
    <header className="glass border-b border-border/30 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Mein Profil
        </h1>
        
        <div className="flex items-center space-x-2">
          <NotificationsCenter
            friendRequests={friendRequests}
            notifications={notifications}
            onAcceptRequest={onAcceptRequest}
            onDeclineRequest={onDeclineRequest}
            onMarkNotificationAsRead={onMarkNotificationAsRead}
            onClearNotification={onClearNotification}
          />
          
          <Button 
            variant="outline"
            onClick={onShowFriendSearch}
            className="hidden sm:flex"
          >
            Freunde suchen
          </Button>
          
          <Button onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
