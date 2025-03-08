
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, PlusCircle } from 'lucide-react';

const Home = () => {
  const { profile, workouts, history } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="container max-w-3xl mx-auto space-y-6">
        {/* Header with profile link */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Home</h1>
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Welcome, {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : 'Athlete'}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Workouts: {workouts.length}</p>
            <p>Completed Sessions: {history.length}</p>
            <p>Current Rank: {profile.rank}</p>
            
            <div className="mt-6">
              <Button onClick={() => navigate('/create-workout')} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        {workouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div key={workout.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{workout.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workout.exercises.length} exercises • {workout.completed ? 'Completed' : 'Not completed'}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/workout/${workout.id}`)}>
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {workouts.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/create-workout')}
                >
                  Create Another Workout
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
