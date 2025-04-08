
import React from 'react';
import { Friend } from '@/types/user';
import { Loader2 } from 'lucide-react';
import ProfileInfo from './ProfileInfo';
import FriendStats from './FriendStats';
import FriendSearch from './FriendSearch';
import { Button } from "@/components/ui/button";
import { User } from '@/types/auth';

interface ProfileContentProps {
  user: User | null;
  height: number | null;
  weight: number | null;
  setHeight: (height: number | null) => void;
  setWeight: (weight: number | null) => void;
  showFriendSearch: boolean;
  setShowFriendSearch: (show: boolean) => void;
  selectedFriend: Friend | null;
  setSelectedFriend: (friend: Friend | null) => void;
  isSearching: boolean;
  handleSendFriendRequest: (username: string) => Promise<void>;
  friends: Friend[];
  friendRequests: any[];
  userStats: {
    workoutsCompleted: number;
    maxWeight: number;
    avgWorkoutDuration: number;
    rank: string;
  };
}

const ProfileContent: React.FC<ProfileContentProps> = ({
  user,
  height,
  weight,
  setHeight,
  setWeight,
  showFriendSearch,
  setShowFriendSearch,
  selectedFriend,
  setSelectedFriend,
  isSearching,
  handleSendFriendRequest,
  friends,
  friendRequests,
  userStats
}) => {
  if (showFriendSearch) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Freunde finden</h2>
        <FriendSearch 
          onSendFriendRequest={handleSendFriendRequest} 
          isSearching={isSearching}
          friends={friends}
          friendRequests={friendRequests}
        />
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setShowFriendSearch(false)}
          >
            Zurück zum Profil
          </Button>
        </div>
      </div>
    );
  } 
  
  if (selectedFriend) {
    return (
      <FriendStats
        friend={selectedFriend}
        userProfile={userStats}
        onBack={() => setSelectedFriend(null)}
      />
    );
  }
  
  return (
    <ProfileInfo 
      user={user}
      height={height}
      weight={weight}
      setHeight={setHeight}
      setWeight={setWeight}
    />
  );
};

export default ProfileContent;
