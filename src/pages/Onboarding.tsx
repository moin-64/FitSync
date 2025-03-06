
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Rank } from '@/utils/rankingUtils';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [birthdate, setBirthdate] = useState('');
  const [height, setHeight] = useState(175); // default in cm
  const [weight, setWeight] = useState(70); // default in kg
  const [experienceLevel, setExperienceLevel] = useState<Rank>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!birthdate) {
      toast({
        title: 'Missing information',
        description: 'Please enter your birthdate',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await updateProfile({
        birthdate,
        height,
        weight,
        experienceLevel,
      });
      
      toast({
        title: 'Profile created',
        description: 'Your profile has been set up successfully!',
      });
      
      // Simulate loading to show the user something is happening
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error('Profile setup failed:', error);
      toast({
        title: 'Setup failed',
        description: 'There was a problem setting up your profile',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && !birthdate) {
      toast({
        title: 'Missing information',
        description: 'Please enter your birthdate',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="birthdate">Date of Birth</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                disabled={isLoading}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>150 cm</span>
                  <span>200 cm</span>
                </div>
                <Slider
                  id="height"
                  min={150}
                  max={200}
                  step={1}
                  value={[height]}
                  onValueChange={(values) => setHeight(values[0])}
                  disabled={isLoading}
                />
                <div className="text-center font-medium text-lg">
                  {height} cm
                </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="weight">Weight (kg)</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>40 kg</span>
                  <span>150 kg</span>
                </div>
                <Slider
                  id="weight"
                  min={40}
                  max={150}
                  step={1}
                  value={[weight]}
                  onValueChange={(values) => setWeight(values[0])}
                  disabled={isLoading}
                />
                <div className="text-center font-medium text-lg">
                  {weight} kg
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <Label htmlFor="experience">Experience Level</Label>
            <RadioGroup
              id="experience"
              value={experienceLevel}
              onValueChange={(value: Rank) => setExperienceLevel(value)}
              className="space-y-3"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2 glass p-3 rounded-lg transition-all hover:border-primary cursor-pointer">
                <RadioGroupItem value="Beginner" id="beginner" />
                <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                  <div className="font-medium">Beginner</div>
                  <div className="text-sm text-muted-foreground">New to fitness or returning after a long break</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 glass p-3 rounded-lg transition-all hover:border-primary cursor-pointer">
                <RadioGroupItem value="Intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                  <div className="font-medium">Intermediate</div>
                  <div className="text-sm text-muted-foreground">Regular workouts for several months</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 glass p-3 rounded-lg transition-all hover:border-primary cursor-pointer">
                <RadioGroupItem value="Advanced" id="advanced" />
                <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                  <div className="font-medium">Advanced</div>
                  <div className="text-sm text-muted-foreground">Consistent training for years with good form</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="glass w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Your Profile</CardTitle>
          <CardDescription className="text-center">
            Let's set up your fitness profile to personalize your experience
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-[31%] h-1 rounded-full ${
                    step <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Step {currentStep + 1} of 3
            </div>
          </div>
          
          {renderStep()}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep > 0 ? (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep < 2 ? (
            <Button onClick={nextStep} disabled={isLoading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
