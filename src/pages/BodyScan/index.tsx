import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BodyScanIntro from '@/components/bodyscan/BodyScanIntro';
import BodyScan360 from '@/components/bodyscan/BodyScan360';
import BodyScanLayout from './BodyScanLayout';
import BodyScan360Analysis from './BodyScan360Analysis';
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
  
  // 360° Scan-Bilder
  const [fullBodyImages, setFullBodyImages] = useState<string[]>([]);
  const [muscleImages, setMuscleImages] = useState<Record<string, string[]>>({});
  
  // Muskelgruppen-Sequenz
  const muscleGroupSequence: MuscleGroup[] = ['chest', 'back', 'shoulders', 'arms', 'abs', 'legs'];
  const [currentMuscleGroupIndex, setCurrentMuscleGroupIndex] = useState(0);
  
  // Handler-Funktionen
  const handleStartScan = () => {
    setScanStage('full-body');
  };
  
  const handleBackClick = () => {
    if (isProcessing) {
      toast({
        title: "Verarbeitung läuft",
        description: "Bitte warten Sie, bis der aktuelle Schritt abgeschlossen ist.",
        variant: "destructive"
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
  
  const handleCaptureFullBody = (images: string[]) => {
    if (images && images.length > 0) {
      setIsProcessing(true);
      try {
        setFullBodyImages(images);
        setTimeout(() => {
          setScanStage('muscle-groups');
          setSelectedMuscleGroup(muscleGroupSequence[0]);
          setIsProcessing(false);
        }, 500);
        
        toast({
          title: "360° Körperscan abgeschlossen",
          description: `${images.length} Winkel erfolgreich aufgenommen`,
        });
      } catch (error) {
        console.error('Error processing full body images:', error);
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
        description: "Keine Bilder konnten aufgenommen werden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  const handleCaptureMuscleGroup = (images: string[]) => {
    if (images && images.length > 0 && selectedMuscleGroup) {
      setIsProcessing(true);
      
      try {
        setMuscleImages(prev => ({
          ...prev,
          [selectedMuscleGroup]: images
        }));
        
        setTimeout(() => {
          if (currentMuscleGroupIndex < muscleGroupSequence.length - 1) {
            const nextIndex = currentMuscleGroupIndex + 1;
            setCurrentMuscleGroupIndex(nextIndex);
            setSelectedMuscleGroup(muscleGroupSequence[nextIndex]);
          } else {
            setScanStage('analysis');
          }
          setIsProcessing(false);
        }, 500);
        
        toast({
          title: "Muskelgruppen-Scan abgeschlossen",
          description: `${images.length} Winkel für ${selectedMuscleGroup} aufgenommen`,
        });
      } catch (error) {
        console.error('Error processing muscle group images:', error);
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
        description: "Keine Bilder konnten aufgenommen werden. Bitte versuche es erneut.",
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
      case 'intro': return '360° Körperscan';
      case 'full-body': return '360° Gesamtkörperscan';
      case 'muscle-groups': 
        return `360° Muskelgruppenscan: ${
          selectedMuscleGroup === 'chest' ? 'Brust' : 
          selectedMuscleGroup === 'back' ? 'Rücken' : 
          selectedMuscleGroup === 'shoulders' ? 'Schultern' : 
          selectedMuscleGroup === 'arms' ? 'Arme' : 
          selectedMuscleGroup === 'abs' ? 'Bauchmuskeln' : 
          selectedMuscleGroup === 'legs' ? 'Beine' : 
          'Muskelgruppe'
        }`;
      case 'analysis': return '360° Analyse';
      case 'results': return '360° Ergebnisse';
      default: return '360° Körperscan';
    }
  };
  
  // Clean up function
  useEffect(() => {
    return () => {
      setFullBodyImages([]);
      setMuscleImages({});
    };
  }, []);
  
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
          <BodyScan360
            onScanComplete={handleCaptureFullBody}
            scanType="full-body"
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
            <BodyScan360
              onScanComplete={handleCaptureMuscleGroup}
              scanType="muscle-group"
              muscleGroup={selectedMuscleGroup || undefined}
              isProcessing={isProcessing}
            />
          </>
        );
      
      case 'analysis':
        return (
          <BodyScan360Analysis 
            userId={user?.id}
            fullBodyImages={fullBodyImages}
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
