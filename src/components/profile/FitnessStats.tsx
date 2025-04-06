
import React from 'react';
import { UserProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FitnessStatsProps {
  profile: UserProfile;
}

const FitnessStats = ({ profile }: FitnessStatsProps) => {
  // Calculate BMI if both height and weight are available
  const calculateBMI = () => {
    if (profile.height && profile.weight && profile.height > 0) {
      const heightInMeters = profile.height / 100;
      const bmi = profile.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return 'N/A';
  };
  
  // BMI classification
  const getBMICategory = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return 'N/A';
    
    if (bmi < 18.5) return 'Untergewicht';
    if (bmi < 25) return 'Normalgewicht';
    if (bmi < 30) return 'Übergewicht';
    if (bmi < 35) return 'Adipositas Grad I';
    if (bmi < 40) return 'Adipositas Grad II';
    return 'Adipositas Grad III';
  };
  
  // Calculate age from birthdate
  const calculateAge = () => {
    if (!profile.birthdate) return 'N/A';
    
    const birthDate = new Date(profile.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="glass mb-8">
      <CardHeader>
        <CardTitle>Fitness Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Rank</p>
            <p className="text-xl font-bold">{profile.rank || 'Beginner'}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Experience</p>
            <p className="text-xl font-bold">{profile.experienceLevel || 'N/A'}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Alter</p>
            <p className="text-xl font-bold">{calculateAge()}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Größe</p>
            <p className="text-xl font-bold">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Gewicht</p>
            <p className="text-xl font-bold">{profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">BMI</p>
            <p className="text-xl font-bold">{calculateBMI()}</p>
            <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessStats;
