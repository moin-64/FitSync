
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, SaveAll, Trash2, ChevronDown, ChevronUp, Loader2, Dumbbell } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Erweiterte Liste mit Fitnessübungen
const availableExercises = [
  { id: 'ex1', name: 'Bench Press', equipment: 'Barbell', videoUrl: '/bench-press.mp4', category: 'Chest' },
  { id: 'ex2', name: 'Squat', equipment: 'Barbell', videoUrl: '/squat.mp4', category: 'Legs' },
  { id: 'ex3', name: 'Deadlift', equipment: 'Barbell', videoUrl: '/deadlift.mp4', category: 'Back' },
  { id: 'ex4', name: 'Pull Up', equipment: 'Body Weight', videoUrl: '/pull-up.mp4', category: 'Back' },
  { id: 'ex5', name: 'Push Up', equipment: 'Body Weight', videoUrl: '/push-up.mp4', category: 'Chest' },
  { id: 'ex6', name: 'Lat Pulldown', equipment: 'Cable Machine', videoUrl: '/lat-pulldown.mp4', category: 'Back' },
  { id: 'ex7', name: 'Leg Press', equipment: 'Machine', videoUrl: '/leg-press.mp4', category: 'Legs' },
  { id: 'ex8', name: 'Bicep Curl', equipment: 'Dumbbell', videoUrl: '/bicep-curl.mp4', category: 'Arms' },
  { id: 'ex9', name: 'Tricep Extension', equipment: 'Cable', videoUrl: '/tricep-extension.mp4', category: 'Arms' },
  { id: 'ex10', name: 'Shoulder Press', equipment: 'Dumbbell', videoUrl: '/shoulder-press.mp4', category: 'Shoulders' },
  { id: 'ex11', name: 'Leg Curl', equipment: 'Machine', videoUrl: '/leg-curl.mp4', category: 'Legs' },
  { id: 'ex12', name: 'Leg Extension', equipment: 'Machine', videoUrl: '/leg-extension.mp4', category: 'Legs' },
  { id: 'ex13', name: 'Chest Fly', equipment: 'Cable', videoUrl: '/chest-fly.mp4', category: 'Chest' },
  { id: 'ex14', name: 'Lateral Raise', equipment: 'Dumbbell', videoUrl: '/lateral-raise.mp4', category: 'Shoulders' },
  { id: 'ex15', name: 'Face Pull', equipment: 'Cable', videoUrl: '/face-pull.mp4', category: 'Shoulders' },
  { id: 'ex16', name: 'Cable Row', equipment: 'Cable', videoUrl: '/cable-row.mp4', category: 'Back' },
  { id: 'ex17', name: 'Calf Raise', equipment: 'Machine', videoUrl: '/calf-raise.mp4', category: 'Legs' },
  { id: 'ex18', name: 'Hammer Curl', equipment: 'Dumbbell', videoUrl: '/hammer-curl.mp4', category: 'Arms' },
  { id: 'ex19', name: 'Skull Crusher', equipment: 'Barbell', videoUrl: '/skull-crusher.mp4', category: 'Arms' },
  { id: 'ex20', name: 'Incline Bench Press', equipment: 'Barbell', videoUrl: '/incline-bench-press.mp4', category: 'Chest' },
  { id: 'ex21', name: 'Romanian Deadlift', equipment: 'Barbell', videoUrl: '/romanian-deadlift.mp4', category: 'Legs' },
  { id: 'ex22', name: 'Pull-Through', equipment: 'Cable', videoUrl: '/pull-through.mp4', category: 'Glutes' },
  { id: 'ex23', name: 'Ab Roller', equipment: 'Ab Wheel', videoUrl: '/ab-roller.mp4', category: 'Core' },
  { id: 'ex24', name: 'Plank', equipment: 'Body Weight', videoUrl: '/plank.mp4', category: 'Core' },
];

// Verbesserte AI-Workout-Generierung
const generateAIWorkout = (limitations: string[] = []) => {
  const warmup = {
    id: `ex-warmup-${Date.now()}`,
    name: 'Cardio Warmup',
    sets: 1,
    reps: 1,
    duration: 600, // 10 minutes in seconds
    restBetweenSets: 60,
    equipment: 'Treadmill',
    weight: 0,
  };
  
  // Zufällige Übungen auswählen basierend auf Kategorien
  const pickRandomExercises = (category: string, count: number) => {
    const categoryExercises = availableExercises.filter(ex => ex.category === category);
    const selected = [];
    for (let i = 0; i < count && i < categoryExercises.length; i++) {
      const randomIndex = Math.floor(Math.random() * categoryExercises.length);
      selected.push(categoryExercises[randomIndex]);
      categoryExercises.splice(randomIndex, 1); // Entferne ausgewählte Übung, um Duplikate zu vermeiden
    }
    return selected;
  };
  
  // Workout-Zusammenstellung
  let exercises = [
    ...pickRandomExercises('Chest', 1),
    ...pickRandomExercises('Back', 1),
    ...pickRandomExercises('Legs', 1),
    ...pickRandomExercises('Arms', 1),
    ...pickRandomExercises('Shoulders', 1),
    ...pickRandomExercises('Core', 1),
  ].map(exercise => ({
    id: `ex-${Date.now()}-${exercise.id}`,
    name: exercise.name,
    sets: Math.floor(Math.random() * 2) + 3, // 3-4 Sätze
    reps: Math.floor(Math.random() * 6) + 8, // 8-12 Wiederholungen
    restBetweenSets: (Math.floor(Math.random() * 4) + 6) * 15, // 90-150 Sekunden Pause
    equipment: exercise.equipment,
    weight: 0, // Standardgewicht, das der Benutzer anpassen kann
  }));
  
  // Limitationen berücksichtigen
  if (limitations.length > 0) {
    if (limitations.some(l => l.toLowerCase().includes('arm') || l.toLowerCase().includes('wrist'))) {
      exercises = exercises.filter(ex => !['Bench Press', 'Bicep Curl', 'Tricep Extension', 'Shoulder Press'].includes(ex.name));
      // Ersetzen durch Beinübungen
      const legExercises = pickRandomExercises('Legs', 2);
      exercises.push(...legExercises.map(exercise => ({
        id: `ex-${Date.now()}-${exercise.id}`,
        name: exercise.name,
        sets: Math.floor(Math.random() * 2) + 3,
        reps: Math.floor(Math.random() * 6) + 8,
        restBetweenSets: (Math.floor(Math.random() * 4) + 6) * 15,
        equipment: exercise.equipment,
        weight: 0,
      })));
    }
    
    if (limitations.some(l => l.toLowerCase().includes('leg') || l.toLowerCase().includes('knee'))) {
      exercises = exercises.filter(ex => !['Squat', 'Leg Press', 'Leg Extension', 'Leg Curl'].includes(ex.name));
      // Ersetzen durch Oberkörperübungen
      const upperBodyExercises = [...pickRandomExercises('Chest', 1), ...pickRandomExercises('Back', 1)];
      exercises.push(...upperBodyExercises.map(exercise => ({
        id: `ex-${Date.now()}-${exercise.id}`,
        name: exercise.name,
        sets: Math.floor(Math.random() * 2) + 3,
        reps: Math.floor(Math.random() * 6) + 8,
        restBetweenSets: (Math.floor(Math.random() * 4) + 6) * 15,
        equipment: exercise.equipment,
        weight: 0,
      })));
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
  weight?: number; // Neues Feld für Gewicht
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
  const [exerciseFilter, setExerciseFilter] = useState('all'); // Filter für Übungskategorie
  
  useEffect(() => {
    // Wenn KI-Workout, generiere ein Workout basierend auf dem Benutzerprofil
    if (state?.type === 'ai') {
      setIsGenerating(true);
      setWorkoutName('KI-generiertes Workout');
      
      // KI-Workout-Generierung simulieren
      setTimeout(() => {
        const aiExercises = generateAIWorkout(profile.limitations);
        setExercises(aiExercises);
        setIsGenerating(false);
      }, 1500);
    } else if (state?.type === 'manual') {
      // Starte mit einem Warm-up für manuelle Workouts
      setExercises([
        {
          id: `ex-warmup-${Date.now()}`,
          name: 'Cardio Warmup',
          sets: 1,
          reps: 1,
          duration: 600, // 10 Minuten in Sekunden
          restBetweenSets: 60,
          equipment: 'Treadmill',
          weight: 0,
        }
      ]);
      setWorkoutName('Mein eigenes Workout');
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
      weight: 0, // Standardgewicht
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
      
      const workout = await addWorkout({
        name: workoutName,
        type: state?.type || 'manual',
        exercises,
        completed: false,
      });
      
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
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Gefilterte Übungen basierend auf Kategorie
  const getFilteredExercises = () => {
    if (exerciseFilter === 'all') {
      return availableExercises;
    }
    return availableExercises.filter(ex => ex.category === exerciseFilter);
  };
  
  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Erstelle dein Workout</h2>
          <p className="text-muted-foreground mb-6">
            Unsere KI erstellt einen personalisierten Trainingsplan für dich...
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
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {state?.type === 'ai' ? 'KI-Trainingsplan' : 'Workout erstellen'}
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
      
      <main className="container mx-auto px-4 py-6">
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
                    
                    {/* Kategorie-Filter */}
                    <div className="mb-2 flex gap-2 overflow-x-auto py-1 no-scrollbar">
                      <Button 
                        variant={exerciseFilter === 'all' ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setExerciseFilter('all')}
                        className="whitespace-nowrap"
                      >
                        Alle
                      </Button>
                      {Array.from(new Set(availableExercises.map(ex => ex.category))).map(category => (
                        <Button
                          key={category}
                          variant={exerciseFilter === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseFilter(category)}
                          className="whitespace-nowrap"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                    
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
                  
                  {/* Gewichtsfeld */}
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
          ))}
        </div>
        
        <Button
          onClick={addExercise}
          className="w-full bg-secondary hover:bg-secondary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Übung hinzufügen
        </Button>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground">Übungen gesamt: {exercises.length}</span>
          </div>
          
          <Button
            onClick={handleSaveWorkout}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Speichern...' : 'Workout speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkout;
