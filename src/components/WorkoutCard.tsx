
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Calendar, Clock, Dumbbell, Camera, Sparkles } from 'lucide-react';

interface WorkoutCardProps {
  id: string;
  name: string;
  exerciseCount: number;
  duration: number;
  type: 'manual' | 'ai' | 'scanned';
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  id,
  name,
  exerciseCount,
  duration,
  type,
  onStart,
  onDelete
}) => {
  const typeConfig = {
    manual: {
      label: 'Custom',
      icon: <Dumbbell className="h-4 w-4" />,
      color: 'bg-primary/20 text-primary'
    },
    ai: {
      label: 'AI Generated',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'bg-secondary/20 text-secondary'
    },
    scanned: {
      label: 'Scanned',
      icon: <Camera className="h-4 w-4" />,
      color: 'bg-muted/50 text-foreground'
    }
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };

  return (
    <Card className="glass card-hover h-full overflow-hidden flex flex-col">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig[type].color}`}>
            {typeConfig[type].icon}
            <span className="ml-1">{typeConfig[type].label}</span>
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{name}</h3>
        
        <div className="text-sm text-muted-foreground space-y-1 mb-4 flex-grow">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <p>{exerciseCount} exercises</p>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1.5" />
            <p>{formatDuration(duration)}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-auto">
          <Button 
            onClick={() => onStart(id)} 
            className="flex-grow bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" /> Start
          </Button>
          
          <Button 
            onClick={() => onDelete(id)} 
            variant="outline" 
            className="p-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutCard;
