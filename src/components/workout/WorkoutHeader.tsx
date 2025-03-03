
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, MicOff } from 'lucide-react';

interface WorkoutHeaderProps {
  workoutName: string;
  isRecording: boolean;
  onBack: () => void;
  onToggleRecording: () => void;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  workoutName,
  isRecording,
  onBack,
  onToggleRecording
}) => {
  return (
    <div className="flex items-center mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="mr-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-bold">{workoutName}</h1>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRecording}
        className="ml-auto"
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default WorkoutHeader;
