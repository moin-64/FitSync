
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Trash2, Dumbbell } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Exercise } from '@/types/exercise';
import { availableExercises } from '@/constants/exerciseData';
import { formatDuration } from '@/utils/workoutGenerationUtils';
import CategoryFilter from './CategoryFilter';

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
  expandedExercise: string | null;
  setExpandedExercise: (id: string | null) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
  exercises: Exercise[];
  exerciseFilter: string;
  setExerciseFilter: (filter: string) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  index,
  expandedExercise,
  setExpandedExercise,
  updateExercise,
  removeExercise,
  exercises,
  exerciseFilter,
  setExerciseFilter
}) => {
  // Get filtered exercises based on category
  const getFilteredExercises = () => {
    if (exerciseFilter === 'all') {
      return availableExercises;
    }
    return availableExercises.filter(ex => ex.category === exerciseFilter);
  };

  // Handle exercise selection with equipment update
  const handleExerciseSelect = (value: string) => {
    const selectedExercise = availableExercises.find(ex => ex.name === value);
    if (selectedExercise) {
      updateExercise(exercise.id, { 
        name: value,
        equipment: selectedExercise.equipment || exercise.equipment,
        videoUrl: selectedExercise.videoUrl || exercise.videoUrl,
        // Set a default weight based on equipment type
        weight: selectedExercise.equipment === 'none' || 
               selectedExercise.equipment === 'body weight' ? 
               0 : (exercise.weight || 10)
      });
    }
  };

  return (
    <Card
      key={exercise.id}
      className={`glass overflow-hidden transition-all duration-300 ${
        expandedExercise === exercise.id ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardHeader
        className="p-4 cursor-pointer"
        onClick={() => setExpandedExercise(
          expandedExercise === exercise.id ? null : exercise.id
        )}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">
            {exercise.name || `Übung ${index + 1}`}
          </CardTitle>
          {expandedExercise === exercise.id ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      
      {expandedExercise === exercise.id && (
        <CardContent className="p-4 pt-0 space-y-4">
          <div>
            <Label htmlFor={`exercise-name-${exercise.id}`}>Übungsname</Label>
            
            <CategoryFilter 
              exerciseFilter={exerciseFilter}
              setExerciseFilter={setExerciseFilter}
            />
            
            <Select
              value={exercise.name}
              onValueChange={handleExerciseSelect}
            >
              <SelectTrigger className="w-full glass" id={`exercise-name-${exercise.id}`}>
                <SelectValue placeholder="Wähle eine Übung" />
              </SelectTrigger>
              <SelectContent>
                {getFilteredExercises().map((ex) => (
                  <SelectItem key={ex.id} value={ex.name}>
                    {ex.name} ({ex.equipment})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Weight field - only show for weighted exercises */}
          {exercise.equipment !== 'none' && 
           exercise.equipment !== 'body weight' && 
           exercise.duration === undefined && (
            <div>
              <Label htmlFor={`weight-${exercise.id}`} className="mb-1 block flex items-center">
                <Dumbbell className="h-4 w-4 mr-2" />
                Gewicht (kg): {exercise.weight || 0}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`weight-${exercise.id}`}
                  type="number"
                  min="0"
                  step="2.5"
                  value={exercise.weight || 0}
                  onChange={(e) => 
                    updateExercise(exercise.id, { weight: parseFloat(e.target.value) || 0 })
                  }
                  className="glass"
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`sets-${exercise.id}`} className="mb-1 block">
                Sätze: {exercise.sets}
              </Label>
              <Slider
                id={`sets-${exercise.id}`}
                min={1}
                max={5}
                step={1}
                value={[exercise.sets]}
                onValueChange={(values) => 
                  updateExercise(exercise.id, { sets: values[0] })
                }
              />
            </div>
            
            {exercise.duration === undefined && (
              <div>
                <Label htmlFor={`reps-${exercise.id}`} className="mb-1 block">
                  Wiederholungen: {exercise.reps}
                </Label>
                <Slider
                  id={`reps-${exercise.id}`}
                  min={1}
                  max={20}
                  step={1}
                  value={[exercise.reps]}
                  onValueChange={(values) => 
                    updateExercise(exercise.id, { reps: values[0] })
                  }
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor={`rest-${exercise.id}`} className="mb-1 block">
              Pause zwischen Sätzen: {formatDuration(exercise.restBetweenSets)}
            </Label>
            <Slider
              id={`rest-${exercise.id}`}
              min={30}
              max={180}
              step={15}
              value={[exercise.restBetweenSets]}
              onValueChange={(values) => 
                updateExercise(exercise.id, { restBetweenSets: values[0] })
              }
            />
          </div>
          
          {exercise.duration !== undefined && (
            <div>
              <Label htmlFor={`duration-${exercise.id}`} className="mb-1 block">
                Dauer: {formatDuration(exercise.duration)}
              </Label>
              <Slider
                id={`duration-${exercise.id}`}
                min={60}
                max={900}
                step={30}
                value={[exercise.duration]}
                onValueChange={(values) => 
                  updateExercise(exercise.id, { duration: values[0] })
                }
              />
            </div>
          )}
          
          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeExercise(exercise.id)}
              className="w-full"
              disabled={exercises.length <= 1}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Übung entfernen
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ExerciseItem;
