
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scan, RotateCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";

interface BodyScanAnalysisProps {
  userId: string | undefined;
  fullBodyImage: string | null;
  muscleImages: Record<string, string>;
  onAnalyzeComplete: (data: any) => void;
}

const BodyScanAnalysis: React.FC<BodyScanAnalysisProps> = ({ 
  userId, 
  fullBodyImage, 
  muscleImages,
  onAnalyzeComplete
}) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const analyzeStages = [
    { name: 'Bildanalyse', description: 'Analysiere Körperproportionen' },
    { name: 'Muskelgruppen-Erkennung', description: 'Identifiziere und bewerte Muskelgruppen' },
    { name: 'Personalisierungsanalyse', description: 'Erstelle individuelles Fitness-Profil' },
    { name: 'Datenverarbeitung', description: 'Berechne Fitness-Metriken' },
    { name: 'Finalisierung', description: 'Erstelle 3D-Modell und Trainingsempfehlungen' }
  ];

  const handleAnalyzeData = async () => {
    if (!userId) {
      toast({
        title: "Fehler",
        description: "Du musst angemeldet sein, um deinen Körper zu analysieren",
        variant: "destructive",
      });
      return;
    }
    
    if (!fullBodyImage) {
      toast({
        title: "Fehler",
        description: "Kein Ganzkörper-Scan vorhanden. Bitte wiederhole den Scan.",
        variant: "destructive",
      });
      return;
    }
    
    const muscleGroupKeys = Object.keys(muscleImages);
    if (muscleGroupKeys.length < 6) {
      toast({
        title: "Fehler",
        description: "Nicht alle Muskelgruppen wurden gescannt. Bitte wiederhole den Scan.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simuliere die verschiedenen KI-Analysephasen
      for (let i = 0; i < analyzeStages.length; i++) {
        const stage = analyzeStages[i];
        setCurrentStage(stage.name);
        
        // Edge-Funktion aufrufen
        const progressPercentage = (i / analyzeStages.length) * 100;
        setProgress(progressPercentage);
        
        // Warte kurz, um den Fortschritt zu zeigen
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Finale KI-Analyse mit der Edge-Funktion
      const { data, error } = await supabase.functions.invoke('analyze-body-scan', {
        body: { 
          userId,
          fullBodyImage,
          muscleImages
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setProgress(100);
      setCurrentStage("Abgeschlossen");
      
      // Kurz warten und dann das Ergebnis zurückgeben
      setTimeout(() => {
        onAnalyzeComplete(data);
      }, 1000);
      
    } catch (error: any) {
      console.error('Error analyzing body scan:', error);
      setError(error.message || "Ein unbekannter Fehler ist aufgetreten");
      
      toast({
        title: "Fehler bei der Analyse",
        description: error.message || "Die Analyse konnte nicht durchgeführt werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-center py-8 space-y-6">
      {!isProcessing ? (
        <>
          <Scan className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4">Analysiere Deine Körperdaten</h2>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            Unsere KI-Technologie analysiert deine Scan-Bilder, um ein präzises 3D-Modell deiner Muskelverteilung und Körperproportionen zu erstellen.
          </p>
          <Button 
            onClick={handleAnalyzeData}
            className="min-w-[200px]"
          >
            Analyse starten
          </Button>
        </>
      ) : (
        <>
          {!error ? (
            <div className="space-y-8">
              {progress < 100 ? (
                <div className="w-16 h-16 mx-auto">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
                    <RotateCw className="w-16 h-16 text-primary animate-spin" />
                  </div>
                </div>
              ) : (
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              )}
              
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {progress < 100 ? currentStage : "Analyse abgeschlossen!"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {progress < 100 
                    ? analyzeStages.find(stage => stage.name === currentStage)?.description
                    : "Deine persönlichen Fitness-Daten wurden erfolgreich analysiert."}
                </p>
              </div>
              
              <div className="w-full max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-sm mt-2">{Math.round(progress)}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
              <h2 className="text-xl font-bold">Analyse fehlgeschlagen</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsProcessing(false);
                  setError(null);
                }}
              >
                Erneut versuchen
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BodyScanAnalysis;
