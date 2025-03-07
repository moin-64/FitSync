
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '../context/UserContext';
import { Exercise } from '@/types/exercise';
import { LocationState } from '@/types/exercise';

export const useWorkoutSave = (
  workoutName: string,
  exercises: Exercise[],
  state: LocationState | undefined
) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { addWorkout } = useUser();
  const { toast } = useToast();

  const handleSaveWorkout = async () => {
    if (!workoutName) {
      toast({
        title: 'Workout-Name erforderlich',
        description: 'Bitte geben Sie Ihrem Workout einen Namen',
        variant: 'destructive',
      });
      return;
    }
    
    if (exercises.length < 2) {
      toast({
        title: 'Mehr Übungen hinzufügen',
        description: 'Ihr Workout sollte mindestens zwei Übungen enthalten',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const newWorkout = {
        name: workoutName,
        type: state?.type || 'manual',
        exercises,
        completed: false,
      };
      
      setTimeout(async () => {
        try {
          await addWorkout(newWorkout);
          
          toast({
            title: 'Workout gespeichert',
            description: 'Ihr Workout wurde erfolgreich gespeichert',
          });
          
          navigate('/home');
        } catch (error) {
          console.error('Fehler beim Speichern des Workouts:', error);
          toast({
            title: 'Fehler',
            description: 'Fehler beim Speichern des Workouts',
            variant: 'destructive',
          });
          setIsSaving(false);
        }
      }, 800);
    } catch (error) {
      console.error('Fehler beim Speichern des Workouts:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern des Workouts',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    setIsSaving,
    handleSaveWorkout
  };
};
