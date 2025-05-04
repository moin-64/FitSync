
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Scan, RotateCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import BodyScanIntro from '@/components/bodyscan/BodyScanIntro';
import BodyScanCamera from '@/components/bodyscan/BodyScanCamera';
import BodyModelViewer from '@/components/bodyscan/BodyModelViewer';
import MuscleGroupInfo from '@/components/bodyscan/MuscleGroupInfo';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type ScanStage = 'intro' | 'full-body' | 'muscle-groups' | 'analysis' | 'results';
type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'abs' | 'legs' | null;

const BodyScan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Zustandsverwaltung
  const [scanStage, setScanStage] = useState<ScanStage>('intro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>(null);
  const [bodyData, setBodyData] = useState<any>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Speicher freigeben, wenn die Komponente unmountet wird
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Handlers
  const handleStartScan = () => {
    setScanStage('full-body');
  };
  
  const handleBackClick = () => {
    // Kamera ausschalten, wenn wir zurück von einer Kameraansicht gehen
    if (scanStage === 'full-body' || scanStage === 'muscle-groups') {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
    
    if (scanStage === 'full-body') {
      setScanStage('intro');
    } else if (scanStage === 'muscle-groups') {
      setScanStage('full-body');
    } else if (scanStage === 'analysis') {
      setScanStage('muscle-groups');
    } else if (scanStage === 'results') {
      setScanStage('analysis');
    } else {
      navigate(-1);
    }
  };
  
  const captureBodyImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return null;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      return canvas.toDataURL('image/jpeg');
    } catch (error) {
      console.error("Error capturing image:", error);
      return null;
    }
  };
  
  const handleCaptureFullBody = () => {
    try {
      const imageData = captureBodyImage();
      if (!imageData) {
        toast({
          title: "Fehler",
          description: "Kamera konnte nicht erfasst werden",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Erfolg",
        description: "Körperscan erfolgreich aufgenommen",
      });
      
      setScanStage('muscle-groups');
    } catch (error) {
      console.error("Error in handleCaptureFullBody:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };
  
  const handleCaptureMuscleGroup = (muscleGroup: MuscleGroup) => {
    try {
      const imageData = captureBodyImage();
      if (!imageData) {
        toast({
          title: "Fehler",
          description: "Kamera konnte nicht erfasst werden",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Erfolg",
        description: `${muscleGroup} Scan erfolgreich aufgenommen`,
      });
      
      setScanStage('analysis');
    } catch (error) {
      console.error("Error in handleCaptureMuscleGroup:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };
  
  const handleAnalyzeData = async () => {
    if (!user) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein, um deinen Körper zu analysieren",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simuliere AI-Analyse mit Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-body-scan', {
        body: { userId: user.id }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Setze Körperdaten aus der Analyse
      setBodyData(data);
      setScanStage('results');
      
    } catch (error) {
      console.error('Error analyzing body scan:', error);
      toast({
        title: "Fehler",
        description: "Analyse konnte nicht durchgeführt werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
      
      // Als Fallback verwenden wir Demo-Daten
      setTimeout(() => {
        setBodyData({
          age: 28,
          height: 180,
          weight: 75,
          bodyFat: 16,
          muscleGroups: {
            chest: { size: 42, strength: 70, development: 65 },
            back: { size: 38, strength: 75, development: 68 },
            shoulders: { size: 48, strength: 60, development: 55 },
            arms: { size: 36, strength: 65, development: 60 },
            abs: { size: 32, strength: 55, development: 50 },
            legs: { size: 58, strength: 80, development: 75 }
          }
        });
        setScanStage('results');
      }, 1000); // Kürzerer Timeout für bessere UX
      
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSelectMuscleGroup = (muscleGroup: MuscleGroup) => {
    setSelectedMuscleGroup(muscleGroup);
  };
  
  const getStageName = () => {
    switch (scanStage) {
      case 'intro': return 'Körperscan';
      case 'full-body': return 'Gesamtkörperscan';
      case 'muscle-groups': return 'Muskelgruppenscan';
      case 'analysis': return 'Analyse';
      case 'results': return 'Ergebnisse';
      default: return 'Körperscan';
    }
  };
  
  const renderStageContent = () => {
    switch (scanStage) {
      case 'intro':
        return <BodyScanIntro onStartScan={handleStartScan} />;
      
      case 'full-body':
        return (
          <BodyScanCamera
            videoRef={videoRef}
            canvasRef={canvasRef}
            onCapture={handleCaptureFullBody}
            instructions="Stelle dich vollständig ins Bild. Drehe dich langsam um 360° für einen vollständigen Scan."
          />
        );
      
      case 'muscle-groups':
        return (
          <BodyScanCamera
            videoRef={videoRef}
            canvasRef={canvasRef}
            onCapture={() => handleCaptureMuscleGroup('chest')}
            instructions="Zeige deine Brustmuskulatur in die Kamera."
            muscleGroup="chest"
          />
        );
      
      case 'analysis':
        return (
          <div className="text-center py-12">
            <Scan className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold mb-4">Analysiere Daten</h2>
            <p className="mb-8 text-muted-foreground">
              Unsere KI analysiert deine Körperdaten und erstellt ein personalisiertes 3D-Modell.
            </p>
            <Button 
              onClick={handleAnalyzeData}
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Analysiere...
                </>
              ) : (
                'Analyse starten'
              )}
            </Button>
          </div>
        );
      
      case 'results':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="model" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="model">3D Modell</TabsTrigger>
                <TabsTrigger value="data">Messdaten</TabsTrigger>
              </TabsList>
              
              <TabsContent value="model" className="py-4">
                <div className="bg-muted rounded-lg p-4">
                  {bodyData ? (
                    <BodyModelViewer 
                      bodyData={bodyData}
                      selectedMuscleGroup={selectedMuscleGroup}
                      onSelectMuscleGroup={handleSelectMuscleGroup}
                    />
                  ) : (
                    <Skeleton className="w-full aspect-square rounded-md" />
                  )}
                </div>
                
                {selectedMuscleGroup && bodyData?.muscleGroups[selectedMuscleGroup] && (
                  <MuscleGroupInfo 
                    muscleGroup={selectedMuscleGroup} 
                    muscleData={bodyData?.muscleGroups[selectedMuscleGroup]}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="data" className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  {bodyData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Alter</p>
                          <p className="text-2xl font-bold">{bodyData.age} Jahre</p>
                        </div>
                        <div className="bg-background p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Größe</p>
                          <p className="text-2xl font-bold">{bodyData.height} cm</p>
                        </div>
                        <div className="bg-background p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Gewicht</p>
                          <p className="text-2xl font-bold">{bodyData.weight} kg</p>
                        </div>
                        <div className="bg-background p-4 rounded-md">
                          <p className="text-sm text-muted-foreground">Körperfett</p>
                          <p className="text-2xl font-bold">{bodyData.bodyFat}%</p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium pt-4">Muskelgruppen-Details</h3>
                      <div className="space-y-2">
                        {bodyData.muscleGroups && Object.entries(bodyData.muscleGroups).map(([muscle, data]: [string, any]) => (
                          <Button 
                            key={muscle}
                            variant="outline" 
                            className="w-full justify-between"
                            onClick={() => handleSelectMuscleGroup(muscle as MuscleGroup)}
                          >
                            <span className="capitalize">{muscle}</span>
                            <div className="flex items-center">
                              <span className="text-sm mr-2">Entwicklung: {data.development}%</span>
                              <Info className="h-4 w-4" />
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => navigate('/create-workout')}
                variant="default"
                className="min-w-[250px]"
              >
                Personalisierten Trainingsplan erstellen
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background animate-page-transition-in">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={handleBackClick}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{getStageName()}</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {renderStageContent()}
        </div>
      </main>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default BodyScan;
