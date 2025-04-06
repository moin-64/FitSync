
import React from 'react';
import { User } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileInfoProps {
  user: User | null;
  height: number | null;
  weight: number | null;
  setHeight: (height: number | null) => void;
  setWeight: (weight: number | null) => void;
}

const ProfileInfo = ({ user, height, weight, setHeight, setWeight }: ProfileInfoProps) => {
  const formatJoinedDate = () => {
    try {
      // Use current date as fallback
      return new Date().toLocaleDateString();
    } catch (error) {
      console.error('Error formatting joined date:', error);
      return new Date().toLocaleDateString();
    }
  };
  
  return (
    <Card className="glass mb-8">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-secondary">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.username}</h3>
              <p className="text-muted-foreground">Joined {formatJoinedDate()}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height || ''}
                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter your height"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter your weight"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;
