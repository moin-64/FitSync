
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
      setFullBodyImage(imageData);
      setScanStage('muscle-groups');
      setSelectedMuscleGroup(muscleGroupSequence[0]);
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
      // Speichere das Bild für die aktuelle Muskelgruppe
      setMuscleImages(prev => ({
        ...prev,
        [selectedMuscleGroup]: imageData
      }));
      
      // Gehe zur nächsten Muskelgruppe oder zur Analyse, wenn alle gescannt wurden
      if (currentMuscleGroupIndex < muscleGroupSequence.length - 1) {
        const nextIndex = currentMuscleGroupIndex + 1;
        setCurrentMuscleGroupIndex(nextIndex);
        setSelectedMuscleGroup(muscleGroupSequence[nextIndex]);
      } else {
        setScanStage('analysis');
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
  
  const renderStageContent = () => {
    switch (scanStage) {
      case 'intro':
        return <BodyScanIntro onStartScan={handleStartScan} />;
      
      case 'full-body':
        return (
          <BodyScanCamera
            onScanComplete={handleCaptureFullBody}
            instructions="Stelle dich vollständig ins Bild. Drehe dich langsam im Kreis für einen vollständigen Scan."
          />
        );
      
      case 'muscle-groups':
        return (
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
          />
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
      {renderStageContent()}
    </BodyScanLayout>
  );
};

export default BodyScan;
