
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Plus } from 'lucide-react';

const Workouts = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Workouts</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Workout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Beispiel Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ein grundlegendes Workout um zu beginnen
              </p>
              <Button variant="outline" className="w-full">
                Workout starten
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Workouts;
