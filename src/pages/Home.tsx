
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, PlusSquare, Camera, LogOut, UserCircle } from 'lucide-react';
import ProblemBar from '@/components/ProblemBar';
import WorkoutCard from '@/components/WorkoutCard';
import WorkoutScanner from '@/components/WorkoutScanner';
import CalorieTracker from '@/components/CalorieTracker';
import HomeMuscleModel from '@/components/home/HomeMuscleModel';
import { Workout } from '@/types/user';

const Home = () => {
  const { profile, workouts, loading, deleteWorkout } = useUser();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      setSavedWorkouts(workouts);
    }
  }, [workouts, loading]);
  
  const handleCreateWorkout = (type: 'manual' | 'ai' | 'scanned') => {
    navigate('/create-workout', { state: { type } });
  };
  
  const handleStartWorkout = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };
  
  const handleDeleteWorkout = (workoutId: string) => {
    try {
      deleteWorkout(workoutId);
      toast({
        title: 'Workout deleted',
        description: 'The workout has been deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the workout',
        variant: 'destructive',
      });
    }
  };
  
  const handleScanWorkout = () => {
    setShowScanner(true);
  };
  
  const handleLimitationAdded = (limitation: string) => {
    toast({
      title: 'Limitation Added',
      description: `We'll adjust your workouts to accommodate your ${limitation}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your fitness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-page-transition-in">
      {showScanner && <WorkoutScanner onClose={() => setShowScanner(false)} />}
      
      <header className="glass border-b border-border/30 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <HomeMuscleModel />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FitSync
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="glass px-3 py-1 rounded-full text-sm font-medium">
              Rank: {profile.rank}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="rounded-full"
              aria-label="User profile"
            >
              <UserCircle className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-full"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Welcome, {user?.username}</h2>
              <p className="text-muted-foreground">Ready for your next workout?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass interactive" onClick={() => handleCreateWorkout('manual')}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">Create Workout</h3>
                <p className="text-sm text-muted-foreground">Build your own custom workout routine</p>
              </CardContent>
            </Card>
            
            <Card className="glass interactive" onClick={() => handleCreateWorkout('ai')}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <PlusSquare className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-bold mb-2">AI Workout</h3>
                <p className="text-sm text-muted-foreground">Get a personalized workout plan</p>
              </CardContent>
            </Card>
            
            <Card className="glass interactive" onClick={handleScanWorkout}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-bold mb-2">Scan Workout</h3>
                <p className="text-sm text-muted-foreground">Import a workout plan using your camera</p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <ProblemBar onLimitationAdded={handleLimitationAdded} />
        
        {/* Calorie tracker positioned between ProblemBar and saved workouts */}
        <CalorieTracker />
        
        {savedWorkouts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Saved Workouts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  id={workout.id}
                  name={workout.name}
                  exerciseCount={workout.exercises.length}
                  duration={workout.exercises.reduce((total: number, ex: any) => 
                    total + (ex.duration || 0) + (ex.sets * ex.restBetweenSets), 0) / 60}
                  type={workout.type as any}
                  onStart={handleStartWorkout}
                  onDelete={handleDeleteWorkout}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
