
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BodyScanIntro from '@/components/bodyscan/BodyScanIntro';
import BodyScanCamera from '@/components/bodyscan/BodyScanCamera';
import BodyScanLayout from './BodyScanLayout';
import BodyScanAnalysis from './BodyScanAnalysis';
import BodyScanResults from './BodyScanResults';

type ScanStage = 'intro' | 'full-body' | 'muscle-groups' | 'analysis' | 'results';
type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'abs' | 'legs' | null;

const BodyScan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [scanStage, setScanStage] = useState<ScanStage>('intro');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>(null);
  const [bodyData, setBodyData] = useState<any>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Free up resources when component unmounts
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
    // Turn off camera when going back from a camera view
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
  
  const handleCaptureFullBody = () => {
    setScanStage('muscle-groups');
  };
  
  const handleCaptureMuscleGroup = () => {
    setScanStage('analysis');
  };
  
  const handleAnalysisComplete = (data: any) => {
    setBodyData(data);
    setScanStage('results');
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
            onCapture={handleCaptureMuscleGroup}
            instructions="Zeige deine Brustmuskulatur in die Kamera."
            muscleGroup="chest"
          />
        );
      
      case 'analysis':
        return (
          <BodyScanAnalysis 
            userId={user?.id}
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
      <canvas ref={canvasRef} className="hidden" />
    </BodyScanLayout>
  );
};

export default BodyScan;
