
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Friend, FriendRequest } from '@/types/user';
import { Loader2 } from 'lucide-react';
import FriendsList from './FriendsList';
import FitnessStats from './FitnessStats';
import LimitationsManager from './LimitationsManager';
import FriendRequests from './FriendRequests';

interface ProfileTabsProps {
  profile: any;
  friendRequests: FriendRequest[];
  friends: Friend[];
  friendsLoading: boolean;
  onViewFriendStats: (friendId: string) => void;
  addLimitation: (limitation: string) => Promise<void>;
  removeLimitation: (limitation: string) => Promise<void>;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profile,
  friendRequests,
  friends,
  friendsLoading,
  onViewFriendStats,
  addLimitation,
  removeLimitation,
  onAcceptRequest,
  onDeclineRequest
}) => {
  return (
    <Tabs defaultValue="stats" className="mb-8">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="stats">Statistiken</TabsTrigger>
        <TabsTrigger value="friends">Freunde</TabsTrigger>
        <TabsTrigger value="requests">Anfragen {friendRequests.length > 0 && `(${friendRequests.length})`}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="stats">
        <FitnessStats profile={profile} />
        
        <LimitationsManager
          limitations={profile.limitations}
          addLimitation={addLimitation}
          removeLimitation={removeLimitation}
        />
      </TabsContent>
      
      <TabsContent value="friends">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Deine Freunde</h2>
          {friendsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <FriendsList 
              friends={friends} 
              onViewStats={onViewFriendStats}
            />
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="requests">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Freundschaftsanfragen</h2>
          <FriendRequests
            requests={friendRequests}
            onAccept={onAcceptRequest}
            onDecline={onDeclineRequest}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
