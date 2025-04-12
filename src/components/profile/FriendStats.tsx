
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Award, Dumbbell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Friend } from "@/types/user";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface FriendStatsProps {
  friend: Friend;
  userProfile: any;
  onBack: () => void;
}

const FriendStats = ({ friend, userProfile, onBack }: FriendStatsProps) => {
  // Get friend stats from either top-level properties or stats object
  const friendWorkoutsCompleted = friend.workoutsCompleted || (friend.stats?.workoutsCompleted || 0);
  const friendMaxWeight = friend.maxWeight || (friend.stats?.maxWeight || 0);
  const friendAvgWorkoutDuration = friend.avgWorkoutDuration || (friend.stats?.avgWorkoutDuration || 0);
  const friendRank = friend.rank || (friend.stats?.rank || 'Beginner');
  const friendSince = friend.since ? new Date(friend.since) : null;
  const lastActive = friend.lastActive || friend.stats?.lastActive;
  
  // Calculate comparison percentages
  const workoutCompletion = friendWorkoutsCompleted > 0 
    ? Math.round((userProfile.workoutsCompleted / friendWorkoutsCompleted) * 100) 
    : 100;
  
  const weightLiftingProgress = friendMaxWeight > 0
    ? Math.round((userProfile.maxWeight / friendMaxWeight) * 100)
    : 100;
  
  const enduranceProgress = friendAvgWorkoutDuration > 0
    ? Math.round((userProfile.avgWorkoutDuration / friendAvgWorkoutDuration) * 100)
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

      {/* Friendship Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Freundschaftsinfo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Freunde seit</span>
            <span className="text-sm">
              {friendSince 
                ? friendSince.toLocaleDateString('de-DE')
                : 'Unbekannt'
              }
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Zuletzt aktiv</span>
            <span className="text-sm">
              {lastActive 
                ? formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: de }) 
                : 'Unbekannt'
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workout Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-primary" />
            Workout Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Abgeschlossene Workouts</span>
              <span className="text-sm text-muted-foreground">
                Du: {userProfile.workoutsCompleted} | {friend.username}: {friendWorkoutsCompleted}
              </span>
            </div>
            <Progress value={workoutCompletion} className="h-2" />
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Max. Gewicht (kg)</span>
              <span className="text-sm text-muted-foreground">
                Du: {userProfile.maxWeight} | {friend.username}: {friendMaxWeight}
              </span>
            </div>
            <Progress value={weightLiftingProgress} className="h-2" />
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Durchschn. Workout-Dauer (min)</span>
              <span className="text-sm text-muted-foreground">
                Du: {Math.round(userProfile.avgWorkoutDuration / 60)} | {friend.username}: {Math.round(friendAvgWorkoutDuration / 60)}
              </span>
            </div>
            <Progress value={enduranceProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Rank Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Trainingsfortschritt
          </CardTitle>
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
              <p className="text-lg font-bold">{friendRank}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendStats;
