
import React, { useMemo } from 'react';
import { 
  Dumbbell, 
  Scale, 
  LineChart, 
  CalendarClock,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface MuscleGroupInfoProps {
  muscleGroup: string;
  muscleData: any;
}

const MuscleGroupInfo: React.FC<MuscleGroupInfoProps> = ({ muscleGroup, muscleData }) => {
  // Zeige Skeleton während Daten geladen werden
  if (!muscleData) {
    return (
      <div className="mt-4 p-4 border rounded-lg">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }
  
  // Empfohlene Übungen für jede Muskelgruppe
  const recommendedExercises = useMemo(() => {
    const exercisesByMuscle: Record<string, string[]> = {
      chest: ['Bankdrücken', 'Fliegende', 'Push-Ups'],
      back: ['Klimmzüge', 'Rudern', 'Lat-Pulldowns'],
      shoulders: ['Schulterdrücken', 'Seitheben', 'Front Raises'],
      arms: ['Bizeps-Curls', 'Trizeps-Extensions', 'Hammercurls'],
      abs: ['Crunches', 'Planks', 'Russian Twists'],
      legs: ['Squats', 'Deadlifts', 'Beinpresse']
    };
    
    return exercisesByMuscle[muscleGroup] || [];
  }, [muscleGroup]);
  
  // Deutsche Übersetzungen der Muskelgruppen
  const getMuscleName = useMemo(() => {
    const muscleNames: Record<string, string> = {
      chest: 'Brust',
      back: 'Rücken',
      shoulders: 'Schultern',
      arms: 'Arme',
      abs: 'Bauch',
      legs: 'Beine'
    };
    
    return muscleNames[muscleGroup] || muscleGroup;
  }, [muscleGroup]);
  
  // Farbberechnung für Fortschrittsbalken
  const getProgressColor = (value: number) => {
    if (value < 40) return 'bg-red-500';
    if (value < 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="mt-4 p-4 border rounded-lg animate-fade-in">
      <h3 className="text-xl font-semibold mb-4">{getMuscleName}</h3>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Scale className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Größe</span>
            </div>
            <span className="font-medium">{muscleData.size}cm</span>
          </div>
          <Progress value={muscleData.size} max={100} className={getProgressColor(muscleData.size)} />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Kraft</span>
            </div>
            <span className="font-medium">{muscleData.strength}%</span>
          </div>
          <Progress value={muscleData.strength} className={getProgressColor(muscleData.strength)} />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LineChart className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Entwicklung</span>
            </div>
            <span className="font-medium">{muscleData.development}%</span>
          </div>
          <Progress value={muscleData.development} className={getProgressColor(muscleData.development)} />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Empfohlene Übungen</span>
          </div>
          <div className="space-y-2">
            {recommendedExercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span>{exercise}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleGroupInfo;
