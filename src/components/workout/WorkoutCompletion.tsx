
import React from 'react';
import { Button } from "@/components/ui/button";

interface WorkoutCompletionProps {
  timeElapsed: number;
  heartRate: number | null;
  caloriesBurned: number | null;
  oxygenSaturation: number | null;
  onHeartRateChange: (value: number | null) => void;
  onCaloriesBurnedChange: (value: number | null) => void;
  onOxygenSaturationChange: (value: number | null) => void;
  onSaveWorkout: () => void;
}

const WorkoutCompletion: React.FC<WorkoutCompletionProps> = ({
  timeElapsed,
  heartRate,
  caloriesBurned,
  oxygenSaturation,
  onHeartRateChange,
  onCaloriesBurnedChange,
  onOxygenSaturationChange,
  onSaveWorkout
}) => {
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold">Workout Complete!</h1>
      </div>
      
      <div className="glass rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Enter Your Stats</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Heart Rate (BPM)
            </label>
            <input
              type="number"
              className="w-full p-2 rounded-md bg-background border border-border"
              placeholder="120"
              min="40"
              max="220"
              value={heartRate || ''}
              onChange={(e) => onHeartRateChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Calories Burned
            </label>
            <input
              type="number"
              className="w-full p-2 rounded-md bg-background border border-border"
              placeholder={`${Math.round(timeElapsed / 60 * 5)}`}
              min="0"
              value={caloriesBurned || ''}
              onChange={(e) => onCaloriesBurnedChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Oxygen Saturation (%)
            </label>
            <input
              type="number"
              className="w-full p-2 rounded-md bg-background border border-border"
              placeholder="98"
              min="80"
              max="100"
              value={oxygenSaturation || ''}
              onChange={(e) => onOxygenSaturationChange(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full"
            onClick={onSaveWorkout}
          >
            Save Workout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCompletion;
