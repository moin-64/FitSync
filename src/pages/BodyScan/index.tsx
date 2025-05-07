
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BodyScanIntro from '@/components/bodyscan/BodyScanIntro';
import BodyScanCamera from '@/components/bodyscan/BodyScanCamera';
import BodyScanLayout from './BodyScanLayout';
import BodyScanAnalysis from './BodyScanAnalysis';
import BodyScanResults from './BodyScanResults';
import { useToast } from '@/hooks/use-toast';

type ScanStage = 'intro' | 'full-body' | 'muscle-groups' | 'analysis' | 'results';
type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'abs' | 'legs' | null;

const BodyScan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State-Management
  const [scanStage, setScanStage] = useState<ScanStage>('intro');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>(null);
  const [bodyData, setBodyData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Scan-Bilder
  const [fullBodyImage, setFullBodyImage] = useState<string | null>(null);
  const [muscleImages, setMuscleImages] = useState<Record<string, string>>({});
  
  // Muskelgruppen-Sequenz
  const muscleGroupSequence: MuscleGroup[] = ['chest', 'back', 'shoulders', 'arms', 'abs', 'legs'];
  const [currentMuscleGroupIndex, setCurrentMuscleGroupIndex] = useState(0);
  
  // Handler-Funktionen
  const handleStartScan = () => {
    setScanStage('full-body');
  };
  
  const handleBackClick = () => {
    if (isProcessing) {
      // Prevent navigation during processing
      toast({
        title: "Verarbeitung läuft",
        description: "Bitte warten Sie, bis der aktuelle Schritt abgeschlossen ist.",
        variant: "warning"
      });
      return;
    }
    
    if (scanStage === 'full-body') {
      setScanStage('intro');
    } else if (scanStage === 'muscle-groups') {
      if (currentMuscleGroupIndex > 0) {
        setCurrentMuscleGroupIndex(currentMuscleGroupIndex - 1);
        setSelectedMuscleGroup(muscleGroupSequence[currentMuscleGroupIndex - 1]);
      } else {
        setScanStage('full-body');
        setCurrentMuscleGroupIndex(0);
      }
    } else if (scanStage === 'analysis') {
      setScanStage('muscle-groups');
      setCurrentMuscleGroupIndex(muscleGroupSequence.length - 1);
    } else if (scanStage === 'results') {
      setScanStage('analysis');
    } else {
      navigate(-1);
    }
  };
  
  const handleCaptureFullBody = (imageData: string | null) => {
    if (imageData) {
      setIsProcessing(true);
      try {
        setFullBodyImage(imageData);
        setTimeout(() => {
          setScanStage('muscle-groups');
          setSelectedMuscleGroup(muscleGroupSequence[0]);
          setIsProcessing(false);
        }, 500); // Short delay for better UX
      } catch (error) {
        console.error('Error processing full body image:', error);
        setIsProcessing(false);
        toast({
          title: "Fehler beim Scannen",
          description: "Es gab ein Problem bei der Bildverarbeitung. Bitte versuche es erneut.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Fehler beim Scannen",
        description: "Bild konnte nicht aufgenommen werden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  const handleCaptureMuscleGroup = (imageData: string | null) => {
    if (imageData && selectedMuscleGroup) {
      setIsProcessing(true);
      
      try {
        // Speichere das Bild für die aktuelle Muskelgruppe
        setMuscleImages(prev => ({
          ...prev,
          [selectedMuscleGroup]: imageData
        }));
        
        // Gehe zur nächsten Muskelgruppe oder zur Analyse, wenn alle gescannt wurden
        setTimeout(() => {
          if (currentMuscleGroupIndex < muscleGroupSequence.length - 1) {
            const nextIndex = currentMuscleGroupIndex + 1;
            setCurrentMuscleGroupIndex(nextIndex);
            setSelectedMuscleGroup(muscleGroupSequence[nextIndex]);
          } else {
            setScanStage('analysis');
          }
          setIsProcessing(false);
        }, 500); // Short delay for better UX
      } catch (error) {
        console.error('Error processing muscle group image:', error);
        setIsProcessing(false);
        toast({
          title: "Fehler beim Scannen",
          description: "Es gab ein Problem bei der Bildverarbeitung. Bitte versuche es erneut.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Fehler beim Scannen",
        description: "Bild konnte nicht aufgenommen werden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  const handleAnalysisComplete = (data: any) => {
    setBodyData(data);
    setScanStage('results');
  };
  
  const getStageName = () => {
    switch (scanStage) {
      case 'intro': return 'Körperscan';
      case 'full-body': return 'Gesamtkörperscan';
      case 'muscle-groups': 
        return `Muskelgruppenscan: ${
          selectedMuscleGroup === 'chest' ? 'Brust' : 
          selectedMuscleGroup === 'back' ? 'Rücken' : 
          selectedMuscleGroup === 'shoulders' ? 'Schultern' : 
          selectedMuscleGroup === 'arms' ? 'Arme' : 
          selectedMuscleGroup === 'abs' ? 'Bauchmuskeln' : 
          selectedMuscleGroup === 'legs' ? 'Beine' : 
          'Muskelgruppe'
        }`;
      case 'analysis': return 'Analyse';
      case 'results': return 'Ergebnisse';
      default: return 'Körperscan';
    }
  };
  
  // Clean up function to ensure we don't leak memory
  useEffect(() => {
    return () => {
      // Clean up image memory on component unmount
      setFullBodyImage(null);
      setMuscleImages({});
    };
  }, []);

  // Progress indicator for muscle groups scan
  const getProgress = () => {
    if (scanStage !== 'muscle-groups') return null;
    return {
      current: currentMuscleGroupIndex + 1,
      total: muscleGroupSequence.length,
      percentage: ((currentMuscleGroupIndex + 1) / muscleGroupSequence.length) * 100
    };
  };
  
  const renderStageContent = () => {
    switch (scanStage) {
      case 'intro':
        return <BodyScanIntro onStartScan={handleStartScan} />;
      
      case 'full-body':
        return (
          <BodyScanCamera
            onScanComplete={handleCaptureFullBody}
            instructions="Stelle dich vollständig ins Bild. Drehe dich langsam im Kreis für einen vollständigen Scan."
            isProcessing={isProcessing}
          />
        );
      
      case 'muscle-groups':
        return (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Gruppe {currentMuscleGroupIndex + 1} von {muscleGroupSequence.length}
              </div>
              <div className="w-2/3 bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${getProgress()?.percentage || 0}%` }}
                ></div>
              </div>
            </div>
            <BodyScanCamera
              onScanComplete={handleCaptureMuscleGroup}
              instructions={
                selectedMuscleGroup === 'chest' ? 'Zeige deine Brustmuskulatur in die Kamera.' : 
                selectedMuscleGroup === 'back' ? 'Drehe deinen Rücken zur Kamera.' : 
                selectedMuscleGroup === 'shoulders' ? 'Stelle deine Schultern optimal ins Bild.' : 
                selectedMuscleGroup === 'arms' ? 'Zeige deine Arme in angespannter Position.' : 
                selectedMuscleGroup === 'abs' ? 'Zeige deine Bauchmuskulatur in die Kamera.' : 
                selectedMuscleGroup === 'legs' ? 'Stelle deine Beine optimal ins Bild.' : 
                'Positioniere die Muskelgruppe für den Scan.'
              }
              muscleGroup={selectedMuscleGroup || undefined}
              isProcessing={isProcessing}
            />
          </>
        );
      
      case 'analysis':
        return (
          <BodyScanAnalysis 
            userId={user?.id}
            fullBodyImage={fullBodyImage}
            muscleImages={muscleImages}
            onAnalyzeComplete={handleAnalysisComplete}
          />
        );
      
      case 'results':
        return <BodyScanResults bodyData={bodyData} />;
        
      default:
        return null;
    }
  };
  
  return (
    <BodyScanLayout title={getStageName()} onBack={handleBackClick}>
      <div className="animate-fade-in">
        {renderStageContent()}
      </div>
    </BodyScanLayout>
  );
};

export default BodyScan;
