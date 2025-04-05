
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import FitnessStats from '@/components/profile/FitnessStats';
import LimitationsManager from '@/components/profile/LimitationsManager';
import FriendSearch from '@/components/profile/FriendSearch';
import FriendsList from '@/components/profile/FriendsList';
import FriendStats from '@/components/profile/FriendStats';
import { Friend } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import FriendRequests from '@/components/profile/FriendRequests';

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
  const [friendsLoading, setFriendsLoading] = useState(false);
  
  // Use effect to update state values when profile changes
  useEffect(() => {
    if (profile) {
      setWeight(profile.weight);
      setHeight(profile.height);
    }
  }, [profile]);
  
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
    if (!username.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen Benutzernamen ein',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSearching(true);
    try {
      await addFriend(username);
      setShowFriendSearch(false);
      toast({
        title: 'Freundschaftsanfrage gesendet',
        description: `Deine Anfrage an ${username} wurde erfolgreich gesendet`,
      });
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
    setFriendsLoading(true);
    try {
      acceptFriendRequest(requestId);
      toast({
        title: 'Freundschaftsanfrage angenommen',
        description: 'Ihr seid jetzt Freunde',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht akzeptiert werden',
        variant: 'destructive',
      });
    } finally {
      setFriendsLoading(false);
    }
  };
  
  const handleDeclineRequest = (requestId: string) => {
    try {
      declineFriendRequest(requestId);
      toast({
        title: 'Freundschaftsanfrage abgelehnt',
        description: 'Die Anfrage wurde abgelehnt',
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht abgelehnt werden',
        variant: 'destructive',
      });
    }
  };
  
  const handleViewFriendStats = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      setSelectedFriend(friend);
    }
  };
  
  // Create mock user stats for comparison with improved calculation
  const userStats = {
    workoutsCompleted: profile.friends?.length ? profile.friends.length + 5 : 5,
    maxWeight: weight ? Math.round(weight * 0.5) : 50,
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
                friends={friends}
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
                        onViewStats={handleViewFriendStats}
                      />
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="requests">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-4">Freundschaftsanfragen</h2>
                    <FriendRequests
                      requests={friendRequests}
                      onAccept={handleAcceptRequest}
                      onDecline={handleDeclineRequest}
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
