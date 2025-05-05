import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileContent from '@/components/profile/ProfileContent';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { Friend } from '@/types/user';

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
    getFriendRequests,
    getNotifications,
    markNotificationAsRead,
    clearNotification
  } = useUser();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [weight, setWeight] = useState<number | null>(profile.weight);
  const [height, setHeight] = useState<number | null>(profile.height);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setWeight(profile.weight);
      setHeight(profile.height);
    }
  }, [profile]);
  
  useEffect(() => {
    try {
      const pendingNotifications = JSON.parse(localStorage.getItem('pendingNotifications') || '[]');
      
      const matchingNotifications = pendingNotifications.filter(
        (item: any) => item.username === user?.username
      );
      
      if (matchingNotifications.length > 0) {
        matchingNotifications.forEach(async (item: any) => {
          const friendRequests = [...(profile.friendRequests || []), item.request];
          const notifications = [...(profile.notifications || []), item.notification];
          
          await updateProfile({
            friendRequests,
            notifications
          });
          
          const remaining = pendingNotifications.filter(
            (pending: any) => pending.username !== user?.username || 
                             pending.request.id !== item.request.id
          );
          localStorage.setItem('pendingNotifications', JSON.stringify(remaining));
          
          toast({
            title: 'Neue Freundschaftsanfrage',
            description: `${item.request.fromUsername} möchte dein Freund sein`,
          });
        });
      }
    } catch (error) {
      console.error('Error checking pending notifications:', error);
    }
  }, [user, profile, updateProfile, toast]);
  
  const friends = getFriends();
  const friendRequests = getFriendRequests();
  const notifications = getNotifications();
  
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
  
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (!success) {
        toast({
          title: 'Fehler',
          description: 'Benachrichtigung konnte nicht als gelesen markiert werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  const handleClearNotification = async (notificationId: string) => {
    try {
      const success = await clearNotification(notificationId);
      if (!success) {
        toast({
          title: 'Fehler',
          description: 'Benachrichtigung konnte nicht entfernt werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  };
  
  const userStats = {
    workoutsCompleted: profile.friends?.length ? profile.friends.length + 5 : 5,
    maxWeight: weight ? Math.round(weight * 0.5) : 50,
    avgWorkoutDuration: 1800,
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
        notifications={notifications}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        onShowFriendSearch={() => setShowFriendSearch(true)}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onClearNotification={handleClearNotification}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <ProfileContent 
            user={user}
            height={height}
            weight={weight}
            setHeight={setHeight}
            setWeight={setWeight}
            showFriendSearch={showFriendSearch}
            setShowFriendSearch={setShowFriendSearch}
            selectedFriend={selectedFriend}
            setSelectedFriend={setSelectedFriend}
            isSearching={isSearching}
            handleSendFriendRequest={handleSendFriendRequest}
            friends={friends}
            friendRequests={friendRequests}
            userStats={userStats}
          />
          
          {!showFriendSearch && !selectedFriend && (
            <ProfileTabs 
              profile={profile}
              friendRequests={friendRequests}
              friends={friends}
              friendsLoading={friendsLoading}
              onViewFriendStats={handleViewFriendStats}
              addLimitation={async (limitation: string) => {
                const success = await addLimitation(limitation);
                return;
              }}
              removeLimitation={async (limitation: string) => {
                const success = await removeLimitation(limitation);
                return;
              }}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
