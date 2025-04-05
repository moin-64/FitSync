
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FriendRequest } from '@/types/user';
import FriendRequests from '@/components/profile/FriendRequests';

interface NotificationsCenterProps {
  friendRequests: FriendRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  friendRequests,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasNotifications = friendRequests.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {friendRequests.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Tabs defaultValue="requests">
          <TabsList className="grid grid-cols-1 w-full mb-4">
            <TabsTrigger value="requests" className="relative">
              Freundschaftsanfragen
              {hasNotifications && (
                <Badge variant="destructive" className="ml-2">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
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
