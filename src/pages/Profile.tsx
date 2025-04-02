
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import FitnessStats from '@/components/profile/FitnessStats';
import LimitationsManager from '@/components/profile/LimitationsManager';

const Profile = () => {
  const { profile, updateProfile, addLimitation, removeLimitation, loading } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [weight, setWeight] = useState<number | null>(profile.weight);
  const [height, setHeight] = useState<number | null>(profile.height);
  
  const handleSave = async () => {
    try {
      await updateProfile({
        weight,
        height
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background animate-page-transition-in">
      <ProfileHeader onSave={handleSave} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <ProfileInfo 
            user={user}
            height={height}
            weight={weight}
            setHeight={setHeight}
            setWeight={setWeight}
          />
          
          <FitnessStats profile={profile} />
          
          <LimitationsManager
            limitations={profile.limitations}
            addLimitation={addLimitation}
            removeLimitation={removeLimitation}
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;
