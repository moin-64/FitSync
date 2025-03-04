
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface WorkoutNameProps {
  workoutName: string;
  setWorkoutName: (name: string) => void;
}

const WorkoutName: React.FC<WorkoutNameProps> = ({ workoutName, setWorkoutName }) => {
  return (
    <div className="mb-6">
      <Label htmlFor="workout-name" className="text-sm font-medium mb-1 block">
        Workout-Name
      </Label>
      <Input
        id="workout-name"
        value={workoutName}
        onChange={(e) => setWorkoutName(e.target.value)}
        placeholder="Gib deinem Workout einen Namen"
        className="glass border-border/30"
      />
    </div>
  );
};

export default WorkoutName;
