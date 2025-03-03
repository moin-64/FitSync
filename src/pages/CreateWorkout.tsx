
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, SaveAll, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for exercise options
const availableExercises = [
  { id: 'ex1', name: 'Bench Press', equipment: 'Barbell', videoUrl: '/bench-press.mp4' },
  { id: 'ex2', name: 'Squat', equipment: 'Barbell', videoUrl: '/squat.mp4' },
  { id: 'ex3', name: 'Deadlift', equipment: 'Barbell', videoUrl: '/deadlift.mp4' },
  { id: 'ex4', name: 'Pull Up', equipment: 'Body Weight', videoUrl: '/pull-up.mp4' },
  { id: 'ex5', name: 'Push Up', equipment: 'Body Weight', videoUrl: '/push-up.mp4' },
  { id: 'ex6', name: 'Lat Pulldown', equipment: 'Cable Machine', videoUrl: '/lat-pulldown.mp4' },
  { id: 'ex7', name: 'Leg Press', equipment: 'Machine', videoUrl: '/leg-press.mp4' },
  { id: 'ex8', name: 'Bicep Curl', equipment: 'Dumbbell', videoUrl: '/bicep-curl.mp4' },
  { id: 'ex9', name: 'Tricep Extension', equipment: 'Cable', videoUrl: '/tricep-extension.mp4' },
  { id: 'ex10', name: 'Shoulder Press', equipment: 'Dumbbell', videoUrl: '/shoulder-press.mp4' },
];

// Mock AI-generated workout
const generateAIWorkout = (limitations: string[] = []) => {
  const warmup = {
    id: `ex-warmup-${Date.now()}`,
    name: 'Cardio Warmup',
    sets: 1,
    reps: 1,
    duration: 600, // 10 minutes in seconds
    restBetweenSets: 60,
    equipment: 'Treadmill',
  };
  
  let exercises = [
    {
      id: `ex-${Date.now()}-1`,
      name: 'Bench Press',
      sets: 3,
      reps: 10,
      restBetweenSets: 90,
      equipment: 'Barbell',
    },
    {
      id: `ex-${Date.now()}-2`,
      name: 'Squat',
      sets: 3,
      reps: 10,
      restBetweenSets: 90,
      equipment: 'Barbell',
    },
    {
      id: `ex-${Date.now()}-3`,
      name: 'Pull Up',
      sets: 3,
      reps: 8,
      restBetweenSets: 90,
      equipment: 'Body Weight',
    },
  ];
  
  // Filter out exercises that would aggravate limitations
  if (limitations.length > 0) {
    if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
      exercises = exercises.filter(ex => !['Bench Press', 'Pull Up', 'Bicep Curl'].includes(ex.name));
      exercises.push({
        id: `ex-${Date.now()}-4`,
        name: 'Leg Press',
        sets: 3,
        reps: 12,
        restBetweenSets: 90,
        equipment: 'Machine',
      });
    }
    
    if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
      exercises = exercises.filter(ex => !['Squat', 'Leg Press'].includes(ex.name));
      exercises.push({
        id: `ex-${Date.now()}-5`,
        name: 'Shoulder Press',
        sets: 3,
        reps: 10,
        restBetweenSets: 90,
        equipment: 'Dumbbell',
      });
    }
  }
  
  return [warmup, ...exercises];
};

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restBetweenSets: number;
  equipment: string;
  videoUrl?: string;
}

interface LocationState {
  type: 'manual' | 'ai' | 'scanned';
}

const CreateWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location as { state: LocationState };
  const { profile, addWorkout } = useUser();
  const { toast } = useToast();
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // If AI workout, generate a workout based on user profile
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setWorkoutName('AI Generated Workout');
      
      // Simulate AI generating a workout
      setTimeout(() => {
        const aiExercises = generateAIWorkout(profile.limitations);
        setExercises(aiExercises);
        setIsGenerating(false);
      }, 1500);
    } else if (state?.type === 'manual') {
      // Start with a warmup for manual workouts
      setExercises([
        {
          id: `ex-warmup-${Date.now()}`,
          name: 'Cardio Warmup',
          sets: 1,
          reps: 1,
          duration: 600, // 10 minutes in seconds
          restBetweenSets: 60,
          equipment: 'Treadmill',
        }
      ]);
      setWorkoutName('My Custom Workout');
    }
  }, [state?.type, profile.limitations]);
  
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: '',
      sets: 3,
      reps: 10,
      restBetweenSets: 60,
      equipment: '',
    };
    
    setExercises([...exercises, newExercise]);
    setExpandedExercise(newExercise.id);
  };
  
  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(
      exercises.map(exercise => 
        exercise.id === id ? { ...exercise, ...updates } : exercise
      )
    );
  };
  
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };
  
  const handleSaveWorkout = async () => {
    if (!workoutName) {
      toast({
        title: 'Workout name required',
        description: 'Please give your workout a name',
        variant: 'destructive',
      });
      return;
    }
    
    if (exercises.length < 2) {
      toast({
        title: 'Add more exercises',
        description: 'Your workout should have at least two exercises',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const workout = await addWorkout({
        name: workoutName,
        type: state?.type || 'manual',
        exercises,
        completed: false,
      });
      
      toast({
        title: 'Workout saved',
        description: 'Your workout has been saved successfully',
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Failed to save workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the workout',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Creating Your Workout</h2>
          <p className="text-muted-foreground mb-6">
            Our AI is designing a personalized workout plan for you...
          </p>
          <div className="glass p-4 rounded-lg text-left space-y-2 max-w-md mx-auto animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 animate-page-transition-in">
      <header className="glass border-b border-border/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="mr-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {state?.type === 'ai' ? 'AI Workout Plan' : 'Create Workout'}
            </h1>
          </div>
          
          <Button
            onClick={handleSaveWorkout}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveAll className="h-4 w-4 mr-2" />
                Save Workout
              </>
            )}
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Label htmlFor="workout-name" className="text-sm font-medium mb-1 block">
            Workout Name
          </Label>
          <Input
            id="workout-name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Give your workout a name"
            className="glass border-border/30"
          />
        </div>
        
        <div className="space-y-4 mb-8">
          {exercises.map((exercise, index) => (
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
                    {exercise.name || `Exercise ${index + 1}`}
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
                    <Label htmlFor={`exercise-name-${exercise.id}`}>Exercise Name</Label>
                    <Select
                      value={exercise.name}
                      onValueChange={(value) => {
                        const selectedExercise = availableExercises.find(ex => ex.name === value);
                        updateExercise(exercise.id, { 
                          name: value,
                          equipment: selectedExercise?.equipment || exercise.equipment,
                          videoUrl: selectedExercise?.videoUrl || exercise.videoUrl
                        });
                      }}
                    >
                      <SelectTrigger className="w-full glass" id={`exercise-name-${exercise.id}`}>
                        <SelectValue placeholder="Select an exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableExercises.map((ex) => (
                          <SelectItem key={ex.id} value={ex.name}>
                            {ex.name} ({ex.equipment})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`sets-${exercise.id}`} className="mb-1 block">
                        Sets: {exercise.sets}
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
                    
                    <div>
                      <Label htmlFor={`reps-${exercise.id}`} className="mb-1 block">
                        Reps: {exercise.reps}
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
                  </div>
                  
                  <div>
                    <Label htmlFor={`rest-${exercise.id}`} className="mb-1 block">
                      Rest Between Sets: {formatDuration(exercise.restBetweenSets)}
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
                        Duration: {formatDuration(exercise.duration)}
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
                      Remove Exercise
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
        
        <Button
          onClick={addExercise}
          className="w-full bg-secondary hover:bg-secondary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">Total exercises: {exercises.length}</span>
          </div>
          
          <Button
            onClick={handleSaveWorkout}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkout;
