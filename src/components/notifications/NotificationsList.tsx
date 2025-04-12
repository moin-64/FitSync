
import React from 'react';
import { Check, X, UserCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/user';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onClear: (notificationId: string) => void;
  onAcceptRequest?: (requestId: string) => void; // New prop
  onDeclineRequest?: (requestId: string) => void; // New prop
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAsRead,
  onClear,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Keine neuen Benachrichtigungen</p>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friendRequest':
        return '👋';
      case 'friendAccepted':
        return '🤝';
      case 'workout':
        return '💪';
      default:
        return '📢';
    }
  };

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`overflow-hidden transition-colors ${!notification.read ? 'bg-muted/30 border-l-4 border-l-primary' : ''}`}
        >
          <CardHeader className="p-3 pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onClear(notification.id)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription className="text-xs">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <p className="text-sm">{notification.message}</p>
          </CardContent>
          <CardFooter className="p-2 flex justify-between">
            {/* Add action buttons for friend requests */}
            {notification.type === 'friendRequest' && notification.requestId && onAcceptRequest && onDeclineRequest && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8 border-red-200 hover:bg-red-50" 
                  onClick={() => onDeclineRequest(notification.requestId!)}
                >
                  <X className="h-3 w-3 mr-1 text-red-500" /> Ablehnen
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs h-8" 
                  onClick={() => onAcceptRequest(notification.requestId!)}
                >
                  <UserCheck className="h-3 w-3 mr-1" /> Annehmen
                </Button>
              </div>
            )}
            
            {/* Mark as read button */}
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 ml-auto" 
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-3 w-3 mr-1" /> Als gelesen markieren
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsList;
