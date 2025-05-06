
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Dumbbell, ArrowRight, Heart, Scale } from 'lucide-react';
import BodyScanCamera from '@/components/bodyscan/BodyScanCamera';
import BodyScanIntro from '@/components/bodyscan/BodyScanIntro';
import { Rank } from '@/types/user';

const fitnessLevels = [
  { level: 'Beginner', description: 'New to fitness, just starting out' },
  { level: 'Intermediate', description: 'Regular exerciser for 6+ months' },
  { level: 'Advanced', description: 'Consistent training for 2+ years' }
];

const onboardingSchema = z.object({
  height: z.number().min(120).max(240),
  weight: z.number().min(30).max(300),
  fitnessLevel: z.string(),
  fitnessGoals: z.array(z.string()),
  limitations: z.array(z.string()).optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const { user } = useAuth();
  const { updateProfile, loading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedLimitations, setSelectedLimitations] = useState<string[]>([]);
  const [isScanningBody, setIsScanningBody] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      height: 175,
      weight: 70,
      fitnessLevel: 'Beginner',
      fitnessGoals: [],
      limitations: [],
    },
  });
  
  const goals = [
    'Lose Weight',
    'Build Muscle',
    'Improve Endurance',
    'Increase Strength',
    'Better Flexibility',
    'Overall Health'
  ];
  
  const limitations = [
    'Back Pain',
    'Knee Problems',
    'Shoulder Injury',
    'Limited Mobility',
    'Heart Condition',
    'None'
  ];
  
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };
  
  const toggleLimitation = (limitation: string) => {
    if (limitation === 'None') {
      setSelectedLimitations(['None']);
      return;
    }
    
    if (selectedLimitations.includes('None')) {
      setSelectedLimitations([limitation]);
      return;
    }
    
    if (selectedLimitations.includes(limitation)) {
      setSelectedLimitations(selectedLimitations.filter(l => l !== limitation));
    } else {
      setSelectedLimitations([...selectedLimitations, limitation]);
    }
  };
  
  const handleStartScan = () => {
    setIsScanningBody(true);
  };
  
  const handleScanComplete = () => {
    setScanComplete(true);
    setIsScanningBody(false);
    setTimeout(() => {
      nextStep();
    }, 1500);
  };
  
  const onSubmit = async (values: OnboardingData) => {
    try {
      // Map fitness level to rank enum
      let userRank: Rank;
      
      switch (values.fitnessLevel) {
        case 'Beginner':
          userRank = Rank.BEGINNER;
          break;
        case 'Intermediate':
          userRank = Rank.INTERMEDIATE;
          break;
        case 'Advanced':
          userRank = Rank.ADVANCED;
          break;
        default:
          userRank = Rank.BEGINNER;
      }
      
      // Combine data and update profile
      await updateProfile({
        height: values.height,
        weight: values.weight,
        rank: userRank,
        limitations: selectedLimitations.includes('None') ? [] : selectedLimitations,
        experience: 0,
        fitness_score: calculateFitnessScore(values, selectedGoals),
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully set up!",
      });
      
      navigate('/home');
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const calculateFitnessScore = (data: OnboardingData, goals: string[]) => {
    // Simple fitness score calculation based on user inputs
    let score = 50; // Base score
    
    // Adjust based on fitness level
    if (data.fitnessLevel === 'Intermediate') score += 15;
    if (data.fitnessLevel === 'Advanced') score += 30;
    
    // Adjust based on BMI (simplified)
    const heightInMeters = data.height / 100;
    const bmi = data.weight / (heightInMeters * heightInMeters);
    if (bmi >= 18.5 && bmi <= 24.9) score += 10;
    
    // Adjust based on goals
    if (goals.includes('Overall Health')) score += 5;
    if (goals.includes('Improve Endurance')) score += 5;
    
    // Cap the score at 100
    return Math.min(score, 100);
  };
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <Skeleton className="h-[300px] w-[300px] rounded-full" />
    </div>;
  }
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardContent className="space-y-6 px-6">
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Height (cm)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={120}
                        max={240}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{field.value}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Weight (kg)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={30}
                        max={300}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{field.value}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Fitness Level</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      {fitnessLevels.map((level) => (
                        <SelectItem key={level.level} value={level.level}>
                          <div>
                            <div>{level.level}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        );
      case 2:
        return (
          <CardContent className="px-6">
            <FormLabel className="text-base block mb-4">Fitness Goals (Select all that apply)</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <div
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedGoals.includes(goal)
                      ? 'bg-primary/20 border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {goal}
                </div>
              ))}
            </div>
            
            <FormLabel className="text-base block mt-6 mb-4">Physical Limitations (if any)</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {limitations.map((limitation) => (
                <div
                  key={limitation}
                  onClick={() => toggleLimitation(limitation)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedLimitations.includes(limitation)
                      ? 'bg-primary/20 border-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {limitation}
                </div>
              ))}
            </div>
          </CardContent>
        );
      case 3:
        return (
          <CardContent className="px-6">
            {isScanningBody ? (
              <div className="space-y-4">
                <BodyScanCamera onScanComplete={handleScanComplete} />
              </div>
            ) : (
              <>
                {scanComplete ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Scale className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium">Scan Completed!</h3>
                    <p className="text-center text-muted-foreground">
                      Your body metrics have been recorded. We'll use this data to customize your experience.
                    </p>
                  </div>
                ) : (
                  <BodyScanIntro onStartScan={handleStartScan} />
                )}
              </>
            )}
          </CardContent>
        );
      case 4:
        return (
          <CardContent className="px-6">
            <div className="space-y-6 py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-center">You're All Set!</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  We've gathered all the information we need to personalize your fitness journey. Get ready to achieve your goals!
                </p>
              </div>
              
              <div className="space-y-3 py-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Height</span>
                  <span className="font-medium">{form.getValues('height')} cm</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{form.getValues('weight')} kg</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-muted-foreground">Fitness Level</span>
                  <span className="font-medium">{form.getValues('fitnessLevel')}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Goals</span>
                  <span className="font-medium text-right">{selectedGoals.join(', ')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Setup Your Profile</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of 4
            </div>
          </div>
          <CardDescription>
            Let's personalize your fitness journey
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            <CardFooter className="flex justify-between border-t p-6">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isScanningBody}
                >
                  Back
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button 
                  type="button" 
                  className={currentStep === 1 ? "w-full" : ""}
                  onClick={nextStep}
                  disabled={isScanningBody || (currentStep === 2 && selectedGoals.length === 0)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="w-full">
                  Complete Setup
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Onboarding;
