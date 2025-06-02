
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square } from 'lucide-react';

const WorkoutSession = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workout Session</h1>
          <p className="text-muted-foreground">Workout ID: {id}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aktueller Fortschritt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-4 mb-6">
              <Button size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
              <Button variant="outline" size="lg">
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              <Button variant="destructive" size="lg">
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </div>
            <p className="text-center text-muted-foreground">
              Workout-Session wird hier angezeigt
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutSession;
