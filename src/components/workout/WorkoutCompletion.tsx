import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from 'lucide-react';
import { formatDuration } from '@/utils/workoutGenerationUtils';
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';

interface WorkoutCompletionProps {
  timeElapsed: number;
  heartRate: number | null;
  caloriesBurned: number | null;
  oxygenSaturation: number | null;
  onHeartRateChange: (value: number | null) => void;
  onCaloriesBurnedChange: (value: number | null) => void;
  onOxygenSaturationChange: (value: number | null) => void;
  onSaveWorkout: () => void;
}

const WorkoutCompletion: React.FC<WorkoutCompletionProps> = ({
  timeElapsed,
  heartRate,
  caloriesBurned,
  oxygenSaturation,
  onHeartRateChange,
  onCaloriesBurnedChange,
  onOxygenSaturationChange,
  onSaveWorkout,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize Supabase client for calling edge functions
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    const getWorkoutAnalysis = async () => {
      try {
        setLoading(true);
        
        // Use the AI edge function to analyze workout data
        const { data, error } = await supabase.functions.invoke('ai-workout', {
          body: { 
            type: "evaluation", 
            data: { 
              duration: timeElapsed,
              heartRate: heartRate || 120,
              calories: caloriesBurned || Math.round(timeElapsed / 60 * 5),
              oxygen: oxygenSaturation || 98,
              struggleDetected: false
            }
          }
        });

        if (error) {
          console.error("Error analyzing workout:", error);
        } else if (data?.result) {
          setAiAnalysis(data.result);
        }
      } catch (error) {
        console.error("Error getting workout analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    if (timeElapsed > 0) {
      getWorkoutAnalysis();
    }
  }, [timeElapsed, heartRate, caloriesBurned, oxygenSaturation]);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-lg glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Workout Complete</CardTitle>
          <p className="text-muted-foreground">Great job! Your workout lasted {formatDuration(timeElapsed)}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="heartRate">Average Heart Rate (BPM)</Label>
              <Input 
                id="heartRate"
                type="number"
                value={heartRate || ''}
                onChange={(e) => onHeartRateChange(e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g., 140"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input 
                id="calories"
                type="number"
                value={caloriesBurned || ''}
                onChange={(e) => onCaloriesBurnedChange(e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g., 350"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="oxygen">Oxygen Saturation (%)</Label>
              <Input 
                id="oxygen"
                type="number"
                value={oxygenSaturation || ''}
                onChange={(e) => onOxygenSaturationChange(e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g., 98"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse">Analyzing your workout...</div>
            </div>
          ) : aiAnalysis ? (
            <Card className="bg-primary/10 border-primary/20">
              <CardHeader className="py-3">
                <CardTitle className="text-base">AI Workout Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{aiAnalysis}</p>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onSaveWorkout}>
            <Save className="h-4 w-4 mr-2" />
            Save Workout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkoutCompletion;
