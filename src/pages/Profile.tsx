
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button"; // Add this import
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import FitnessStats from '@/components/profile/FitnessStats';
import LimitationsManager from '@/components/profile/LimitationsManager';
import FriendSearch from '@/components/profile/FriendSearch';
import FriendsList from '@/components/profile/FriendsList';
import FriendStats from '@/components/profile/FriendStats';
import { Friend } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { 
    profile, 
    updateProfile, 
    addLimitation, 
    removeLimitation, 
    loading,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    getFriendRequests
  } = useUser();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [weight, setWeight] = useState<number | null>(profile.weight);
  const [height, setHeight] = useState<number | null>(profile.height);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  const friends = getFriends();
  const friendRequests = getFriendRequests();
  
  const handleSave = async () => {
    try {
      await updateProfile({
        weight,
        height
      });
      
      toast({
        title: 'Profil aktualisiert',
        description: 'Dein Profil wurde erfolgreich aktualisiert',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Fehler',
        description: 'Dein Profil konnte nicht aktualisiert werden',
        variant: 'destructive',
      });
    }
  };
  
  const handleSendFriendRequest = async (username: string) => {
    setIsSearching(true);
    try {
      await addFriend(username);
      setShowFriendSearch(false);
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Freundschaftsanfrage konnte nicht gesendet werden',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequest(requestId);
  };
  
  const handleDeclineRequest = (requestId: string) => {
    declineFriendRequest(requestId);
  };
  
  const handleViewFriendStats = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      setSelectedFriend(friend);
    }
  };
  
  // Create mock user stats for comparison
  const userStats = {
    workoutsCompleted: profile.friends?.length || 0 + 5,
    maxWeight: weight ? weight * 0.5 : 50,
    avgWorkoutDuration: 1800, // 30 minutes in seconds
    rank: profile.rank
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Lade dein Profil...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background animate-page-transition-in">
      <ProfileHeader 
        onSave={handleSave} 
        friendRequests={friendRequests}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        onShowFriendSearch={() => setShowFriendSearch(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {showFriendSearch ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Freunde finden</h2>
              <FriendSearch 
                onSendFriendRequest={handleSendFriendRequest} 
                isSearching={isSearching}
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
          ) : selectedFriend ? (
            <FriendStats
              friend={selectedFriend}
              userProfile={userStats}
              onBack={() => setSelectedFriend(null)}
            />
          ) : (
            <>
              <ProfileInfo 
                user={user}
                height={height}
                weight={weight}
                setHeight={setHeight}
                setWeight={setWeight}
              />
              
              <Tabs defaultValue="stats" className="mb-8">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="stats">Statistiken</TabsTrigger>
                  <TabsTrigger value="friends">Freunde</TabsTrigger>
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
                    <FriendsList 
                      friends={friends} 
                      onViewStats={handleViewFriendStats}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
