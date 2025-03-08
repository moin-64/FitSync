
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutHistory } from "@/types/user";
import { formatDuration } from "@/utils/trainingParametersUtils";

interface ProfileStatsProps {
  history: WorkoutHistory[];
}

export const ProfileStats = ({ history }: ProfileStatsProps) => {
  // Calculate statistics
  const completedWorkouts = history.length;
  const totalTime = history.reduce((total, workout) => total + workout.duration, 0);
  const averagePerformance = history.length > 0 
    ? Math.round(history.reduce((total, workout) => total + workout.performance, 0) / history.length) 
    : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="bg-purple-50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-center text-sm font-medium text-muted-foreground">Workouts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-center text-3xl font-bold">{completedWorkouts}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-center text-sm font-medium text-muted-foreground">Total Time</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-center text-3xl font-bold">{formatDuration(totalTime)}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-center text-sm font-medium text-muted-foreground">Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-center text-3xl font-bold">{averagePerformance}%</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
