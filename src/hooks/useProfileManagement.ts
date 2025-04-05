
import { useState } from 'react';
import { UserData, UserProfile } from '@/types/user';
import { saveUserData } from '@/utils/userContext.utils';

export function useProfileManagement(
  userData: UserData,
  setUserData: (data: UserData) => void
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: Partial<UserProfile>) => {
    setIsUpdating(true);
    try {
      const updatedProfile = { ...userData.profile, ...data };
      const updatedData = { ...userData, profile: updatedProfile };
      await saveUserData(updatedData);
      setUserData(updatedData);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const addLimitation = async (limitation: string) => {
    if (userData.profile.limitations.includes(limitation)) return;
    
    const updatedLimitations = [...userData.profile.limitations, limitation];
    await updateProfile({ limitations: updatedLimitations });
  };

  const removeLimitation = async (limitation: string) => {
    const updatedLimitations = userData.profile.limitations.filter(l => l !== limitation);
    await updateProfile({ limitations: updatedLimitations });
  };

  return {
    updateProfile,
    addLimitation,
    removeLimitation,
    isUpdating
  };
}
