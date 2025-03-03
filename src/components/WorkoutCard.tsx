
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from 'lucide-react';

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
  const typeLabels = {
    manual: 'Custom',
    ai: 'AI Generated',
    scanned: 'Scanned'
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
          <span className="pill bg-secondary/20 text-secondary-foreground">
            {typeLabels[type]}
          </span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">{name}</h3>
        
        <div className="text-sm text-muted-foreground mb-4 flex-grow">
          <p>{exerciseCount} exercises</p>
          <p>{formatDuration(duration)}</p>
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
