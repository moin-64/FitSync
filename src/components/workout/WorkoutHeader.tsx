
import React from 'react';
import { Button } from "@/components/ui/button";
import { SaveAll, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutHeaderProps {
  type?: 'ai' | 'manual' | 'scanned';
  isSaving: boolean;
  onSaveWorkout: () => void;
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ 
  type = 'manual', 
  isSaving, 
  onSaveWorkout 
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="glass border-b border-border/30 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="mr-2"
            aria-label="Zurück"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">
            {type === 'ai' ? 'KI-Trainingsplan' : 'Workout erstellen'}
          </h1>
        </div>
        
        <Button
          onClick={onSaveWorkout}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <SaveAll className="h-4 w-4 mr-2" />
              Workout speichern
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export default WorkoutHeader;
