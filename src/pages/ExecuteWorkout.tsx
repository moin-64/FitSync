import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Heart, Activity, Fire, AlertTriangle } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ExecuteWorkout = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { workouts, completeWorkout } = useUser();
  const { toast } = useToast();
  
  const [workout, setWorkout] = useState(workouts?.find(w => w.id === workoutId));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [averageHeartRate, setAverageHeartRate] = useState(80);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [oxygenSaturation, setOxygenSaturation] = useState(95);
  const [performanceScore, setPerformanceScore] = useState(75);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [restTime, setRestTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (workouts) {
      setWorkout(workouts.find(w => w.id === workoutId));
    }
  }, [workoutId, workouts]);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isRunning) {
      intervalId = setInterval(() => {
        setTotalTime(prevTime => prevTime + 1);
        setExerciseTime(prevTime => prevTime + 1);
        
        // Simuliere Herzfrequenz, Kalorienverbrauch und Sauerstoffsättigung
        setAverageHeartRate(prevRate => Math.min(180, prevRate + Math.random() * 2 - 1));
        setCaloriesBurned(prevCalories => prevCalories + 0.1);
        setOxygenSaturation(prevSaturation => Math.max(90, prevSaturation - Math.random() * 0.1));
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [isRunning]);
  
  useEffect(() => {
    if (workout) {
      document.title = `Workout: ${workout.name} | FitConnect`;
    } else {
      document.title = 'Workout Details | FitConnect';
    }
  }, [workout]);
  
  const startWorkout = () => {
    setIsRunning(true);
  };
  
  const pauseWorkout = () => {
    setIsRunning(false);
  };
  
  const nextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setIsRunning(false);
      setShowRestTimer(true);
      setExerciseTime(0);
      
      // Starte den Rest-Timer
      startRestTimer();
    } else {
      finishWorkout();
    }
  };
  
  const startRestTimer = () => {
    setRestTime(workout.exercises[currentExerciseIndex].restBetweenSets);
    
    restTimerRef.current = setInterval(() => {
      setRestTime(prevTime => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(restTimerRef.current!);
          restTimerRef.current = null;
          setShowRestTimer(false);
          setIsRunning(true);
          return 0;
        }
      });
    }, 1000);
  };
  
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const finishWorkout = () => {
    setIsRunning(false);
    
    // Berechnung des Performance-Scores
    const calculatedScore = Math.min(100, Math.max(0, 
      70 + (100 - averageHeartRate) * 0.5 + oxygenSaturation * 0.2 - caloriesBurned * 0.01
    ));
    setPerformanceScore(calculatedScore);
  };
  
  const submitPerformanceData = () => {
    completeWorkout(workout.id, {
      duration: totalTime,
      heart_rate: averageHeartRate,
      calories_burned: caloriesBurned,
      oxygen_saturation: oxygenSaturation,
      performance: performanceScore
    });
    
    toast({
      title: "Workout abgeschlossen!",
      description: "Deine Performance wurde gespeichert.",
    });
    
    navigate('/history');
  };
  
  if (!workout) {
    return <div>Workout not found.</div>;
  }
  
  const currentExercise = workout.exercises[currentExerciseIndex];
  const workoutProgress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;
  
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{workout.name}</CardTitle>
          <CardDescription>
            {isRunning ? 'Workout läuft...' : 'Bereit für dein Training?'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid gap-4">
          {showRestTimer ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Pause</h2>
              <CircularProgressbar
                value={restTime}
                maxValue={workout.exercises[currentExerciseIndex].restBetweenSets}
                text={formatTime(restTime)}
                styles={buildStyles({
                  textColor: '#3b82f6',
                  pathColor: '#3b82f6',
                  trailColor: '#dbeafe',
                })}
              />
              <p className="text-sm text-muted-foreground mt-2">Nächste Übung in {formatTime(restTime)}</p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">{currentExercise.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Satz {currentExercise.sets}, Wiederholungen {currentExercise.reps}
                </p>
                <p className="text-sm text-muted-foreground">
                  Equipment: {currentExercise.equipment}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium">Zeit</p>
                  <div className="flex items-center justify-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(exerciseTime)}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium">Gesamtzeit</p>
                  <div className="flex items-center justify-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(totalTime)}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium">Herzfrequenz</p>
                  <div className="flex items-center justify-center">
                    <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{averageHeartRate} bpm</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium">Kalorien</p>
                  <div className="flex items-center justify-center">
                    <Fire className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{caloriesBurned.toFixed(0)}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium">Sauerstoff</p>
                  <div className="flex items-center justify-center">
                    <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{oxygenSaturation}%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Progress value={workoutProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">{currentExerciseIndex + 1} / {workout.exercises.length} Übungen</p>
          
          {!isRunning && !showRestTimer && (
            <div className="flex justify-center space-x-4">
              {isRunning ? (
                <Button variant="secondary" onClick={pauseWorkout}>Pause</Button>
              ) : (
                <Button onClick={startWorkout}>Start</Button>
              )}
              
              {currentExerciseIndex < workout.exercises.length - 1 ? (
                <Button onClick={nextExercise} disabled={!isRunning}>Nächste Übung</Button>
              ) : (
                <Button onClick={finishWorkout} disabled={!isRunning}>Workout beenden</Button>
              )}
            </div>
          )}
          
          {currentExerciseIndex === workout.exercises.length - 1 && !isRunning && !showRestTimer && (
            <>
              <Separator />
              
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Performance Auswertung</h3>
                <p className="text-muted-foreground">
                  Bewerte deine Leistung, um zukünftige Workouts zu optimieren.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="avgHeartRate">Durchschnittliche Herzfrequenz</Label>
                    <Input type="number" id="avgHeartRate" value={averageHeartRate} onChange={(e) => setAverageHeartRate(Number(e.target.value))} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="calories">Verbrannte Kalorien</Label>
                    <Input type="number" id="calories" value={caloriesBurned.toFixed(0)} onChange={(e) => setCaloriesBurned(Number(e.target.value))} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="oxygen">Sauerstoffsättigung</Label>
                    <Input type="number" id="oxygen" value={oxygenSaturation} onChange={(e) => setOxygenSaturation(Number(e.target.value))} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performance">Performance Score</Label>
                    <Slider
                      defaultValue={[performanceScore]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setPerformanceScore(value[0])}
                    />
                    <span>{performanceScore}</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" onClick={submitPerformanceData}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Daten speichern und abschließen
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExecuteWorkout;
