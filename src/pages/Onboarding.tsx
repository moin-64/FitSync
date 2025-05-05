
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Scan, Camera, Check } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Rank } from '@/utils/rankingUtils';
import useCameraCapture from '@/hooks/useCameraCapture';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [birthdate, setBirthdate] = useState('');
  const [height, setHeight] = useState(175); // default in cm
  const [weight, setWeight] = useState(70); // default in kg
  const [experienceLevel, setExperienceLevel] = useState<Rank>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [bodyScanComplete, setBodyScanComplete] = useState(false);
  const { updateProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Refs for body scan camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { captureImage, startCamera, stopCamera, cameraReady } = useCameraCapture({ videoRef, canvasRef });

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
        title: 'Profil erstellt',
        description: 'Dein Profil wurde erfolgreich eingerichtet!',
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
    
    // If we're moving to the body scan step, initialize the camera
    if (currentStep === 2) {
      setTimeout(() => {
        startCamera();
      }, 500);
    }
    
    // If we're moving away from the body scan step, stop the camera
    if (currentStep === 3) {
      stopCamera();
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    // If we're moving away from the body scan step, stop the camera
    if (currentStep === 3) {
      stopCamera();
    }
    
    setCurrentStep(prev => prev - 1);
  };

  const handleBodyScan = async () => {
    setIsLoading(true);
    
    try {
      const imageData = captureImage();
      if (imageData) {
        // In a real implementation, we would send this image to our AI analysis service
        // For now, we'll simulate the scan completion
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setBodyScanComplete(true);
        toast({
          title: 'Bodyscan erfolgreich',
          description: 'Deine Körperdaten wurden erfasst und analysiert.',
        });
      } else {
        toast({
          title: 'Scan fehlgeschlagen',
          description: 'Die Kamera konnte kein klares Bild aufnehmen.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Body scan failed:', error);
      toast({
        title: 'Scan fehlgeschlagen',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="birthdate">Geburtsdatum</Label>
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
              <Label htmlFor="height">Größe (cm)</Label>
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
              <Label htmlFor="weight">Gewicht (kg)</Label>
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
            <Label htmlFor="experience">Erfahrungslevel</Label>
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
                  <div className="font-medium">Anfänger</div>
                  <div className="text-sm text-muted-foreground">Neu im Fitness oder nach langer Pause zurück</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 glass p-3 rounded-lg transition-all hover:border-primary cursor-pointer">
                <RadioGroupItem value="Intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                  <div className="font-medium">Fortgeschritten</div>
                  <div className="text-sm text-muted-foreground">Regelmäßiges Training seit mehreren Monaten</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 glass p-3 rounded-lg transition-all hover:border-primary cursor-pointer">
                <RadioGroupItem value="Advanced" id="advanced" />
                <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                  <div className="font-medium">Erfahren</div>
                  <div className="text-sm text-muted-foreground">Konstantes Training seit Jahren mit guter Form</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <Scan className="h-12 w-12 mx-auto mb-2 text-primary" />
              <h3 className="text-xl font-bold">Körperscan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Für eine präzise Trainingsanalyse benötigen wir einen Scan deines Körpers
              </p>
            </div>
            
            {bodyScanComplete ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Scan abgeschlossen</h4>
                  <p className="text-sm text-muted-foreground">Deine Körperdaten wurden erfolgreich erfasst</p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline
                    muted 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Silhouette-Guide als Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[60%] h-[80%] border-2 border-dashed border-white/40 rounded-full opacity-40"></div>
                  </div>
                  
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white">Kamera wird initialisiert...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center mt-4">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Stelle dich vollständig ins Bild. Achte darauf, dass dein ganzer Körper sichtbar ist.
                  </p>
                  
                  <Button 
                    onClick={handleBodyScan}
                    size="lg"
                    className="min-w-[200px]"
                    disabled={!cameraReady || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verarbeite...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Scan starten
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
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
          <CardTitle className="text-2xl font-bold text-center">Dein Profil</CardTitle>
          <CardDescription className="text-center">
            Richte dein Fitness-Profil ein, um deine Erfahrung zu personalisieren
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-[23%] h-1 rounded-full ${
                    step <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Schritt {currentStep + 1} von 4
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
              Zurück
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep < 3 ? (
            <Button onClick={nextStep} disabled={isLoading}>
              Weiter
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading || !bodyScanComplete}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Einrichtung...
                </>
              ) : (
                'Einrichtung abschließen'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
