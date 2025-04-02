
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Save, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { profile, updateProfile, addLimitation, removeLimitation, loading } = useUser();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [weight, setWeight] = useState<number | null>(profile.weight);
  const [height, setHeight] = useState<number | null>(profile.height);
  const [newLimitation, setNewLimitation] = useState('');
  
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
  
  const handleAddLimitation = async () => {
    if (!newLimitation.trim()) return;
    
    try {
      await addLimitation(newLimitation.trim());
      setNewLimitation('');
      
      toast({
        title: 'Limitation added',
        description: 'Your limitation has been added successfully',
      });
    } catch (error) {
      console.error('Failed to add limitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add your limitation',
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveLimitation = async (limitation: string) => {
    try {
      await removeLimitation(limitation);
      
      toast({
        title: 'Limitation removed',
        description: 'Your limitation has been removed successfully',
      });
    } catch (error) {
      console.error('Failed to remove limitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove your limitation',
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
      <header className="glass border-b border-border/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          
          <Button onClick={handleSave} size="sm" className="gap-1">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
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
                    <p className="text-muted-foreground">Joined {new Date().toLocaleDateString()}</p>
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
          
          <Card className="glass">
            <CardHeader>
              <CardTitle>Limitations & Injuries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {profile.limitations.length > 0 ? (
                    profile.limitations.map((limitation) => (
                      <Badge key={limitation} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm flex items-center gap-1">
                        {limitation}
                        <button 
                          onClick={() => handleRemoveLimitation(limitation)}
                          className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No limitations added yet.</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newLimitation}
                    onChange={(e) => setNewLimitation(e.target.value)}
                    placeholder="Add a new limitation or injury"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLimitation()}
                  />
                  <Button onClick={handleAddLimitation} type="button">Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
