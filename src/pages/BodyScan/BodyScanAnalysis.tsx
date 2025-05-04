
import React from 'react';
import { Button } from "@/components/ui/button";
import { Scan, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BodyScanAnalysisProps {
  userId: string | undefined;
  onAnalyzeComplete: (data: any) => void;
}

const BodyScanAnalysis: React.FC<BodyScanAnalysisProps> = ({ userId, onAnalyzeComplete }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleAnalyzeData = async () => {
    if (!userId) {
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
        body: { userId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Setze Körperdaten aus der Analyse
      onAnalyzeComplete(data);
      
    } catch (error) {
      console.error('Error analyzing body scan:', error);
      toast({
        title: "Fehler",
        description: "Analyse konnte nicht durchgeführt werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
      
      // Als Fallback verwenden wir Demo-Daten
      setTimeout(() => {
        onAnalyzeComplete({
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
      }, 1000);
      
    } finally {
      setIsProcessing(false);
    }
  };

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
};

export default BodyScanAnalysis;
