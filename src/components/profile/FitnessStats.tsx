
import React from 'react';
import { UserProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FitnessStatsProps {
  profile: UserProfile;
}

const FitnessStats = ({ profile }: FitnessStatsProps) => {
  return (
    <Card className="glass mb-8">
      <CardHeader>
        <CardTitle>Fitness Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Rank</p>
            <p className="text-xl font-bold">{profile.rank}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Experience</p>
            <p className="text-xl font-bold">{profile.experienceLevel || 'N/A'}</p>
          </div>
          
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Age</p>
            <p className="text-xl font-bold">
              {profile.birthdate 
                ? Math.floor((new Date().getTime() - new Date(profile.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessStats;
