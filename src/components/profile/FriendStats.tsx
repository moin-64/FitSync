
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/user";

interface FriendStatsProps {
  friend: Friend;
  userProfile: any;
  onBack: () => void;
}

const FriendStats = ({ friend, userProfile, onBack }: FriendStatsProps) => {
  // Calculate comparison percentages
  const workoutCompletion = friend.workoutsCompleted > 0 
    ? Math.round((userProfile.workoutsCompleted / friend.workoutsCompleted) * 100) 
    : 100;
  
  const weightLiftingProgress = friend.maxWeight > 0
    ? Math.round((userProfile.maxWeight / friend.maxWeight) * 100)
    : 100;
  
  const enduranceProgress = friend.avgWorkoutDuration > 0
    ? Math.round((userProfile.avgWorkoutDuration / friend.avgWorkoutDuration) * 100)
    : 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="p-0 mr-2" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-bold">Statistik Vergleich mit {friend.username}</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workout Statistiken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Abgeschlossene Workouts</span>
              <span className="text-sm text-muted-foreground">
                Du: {userProfile.workoutsCompleted} | {friend.username}: {friend.workoutsCompleted}
              </span>
            </div>
            <Progress value={workoutCompletion} className="h-2" />
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Max. Gewicht (kg)</span>
              <span className="text-sm text-muted-foreground">
                Du: {userProfile.maxWeight} | {friend.username}: {friend.maxWeight}
              </span>
            </div>
            <Progress value={weightLiftingProgress} className="h-2" />
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Durchschn. Workout-Dauer (min)</span>
              <span className="text-sm text-muted-foreground">
                Du: {Math.round(userProfile.avgWorkoutDuration / 60)} | {friend.username}: {Math.round(friend.avgWorkoutDuration / 60)}
              </span>
            </div>
            <Progress value={enduranceProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Trainingsfortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Dein Rang</h4>
              <p className="text-lg font-bold">{userProfile.rank}</p>
            </div>
            
            <Separator orientation="vertical" className="h-10 mx-4" />
            
            <div>
              <h4 className="font-semibold">{friend.username}s Rang</h4>
              <p className="text-lg font-bold">{friend.rank}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendStats;
