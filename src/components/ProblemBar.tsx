
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, AlertOctagon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ProblemBarProps {
  onLimitationAdded?: (limitation: string) => void;
}

const ProblemBar: React.FC<ProblemBarProps> = ({ onLimitationAdded }) => {
  const [limitation, setLimitation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const { addLimitation } = useUser();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!limitation.trim()) return;
    
    try {
      setSubmitting(true);
      setAiAnalysis(null);

      // Get AI analysis of the limitation
      const { data, error } = await supabase.functions.invoke('ai-workout', {
        body: { 
          type: "problem", 
          data: { 
            limitation: limitation 
          }
        }
      });

      if (error) {
        console.error("Error analyzing limitation:", error);
        toast({
          title: "Fehler",
          description: "Analyse der Einschränkung fehlgeschlagen",
          variant: "destructive",
        });
      } else if (data?.result) {
        // Save the AI analysis for display
        setAiAnalysis(data.result);
        
        // Show the AI analysis as a toast
        toast({
          title: "Einschränkung analysiert",
          description: data.result.substring(0, 255) + (data.result.length > 255 ? "..." : ""),
          duration: 5000,
        });
        
        // Add the limitation to the user profile
        await addLimitation(limitation);
        
        if (onLimitationAdded) {
          onLimitationAdded(limitation);
        }
        
        setLimitation('');
      }
    } catch (error) {
      console.error('Failed to add limitation:', error);
      toast({
        title: "Fehler",
        description: "Einschränkung konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-5 left-0 right-0 px-4 md:px-6 z-10 animate-fade-in">
      <div className="mx-auto max-w-2xl glass rounded-full p-2 flex items-center shadow-lg">
        <AlertOctagon className="ml-2 mr-1 h-5 w-5 text-amber-500" />
        <Input
          type="text"
          placeholder="Beschreibe Einschränkungen, die du heute hast (z.B. verletztes Handgelenk, Rückenschmerzen)"
          value={limitation}
          onChange={(e) => setLimitation(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full border-none rounded-full bg-transparent focus:ring-0 text-white text-sm"
          disabled={submitting}
        />
        <Button
          onClick={handleSubmit}
          disabled={!limitation.trim() || submitting}
          className="rounded-full p-2 ml-2 text-white bg-primary hover:bg-primary/90 duration-200"
          aria-label="Submit limitation"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      
      {aiAnalysis && (
        <div className="mt-2 mx-auto max-w-2xl p-4 glass rounded-lg shadow-lg text-sm">
          <h4 className="text-white font-medium mb-1">KI-Analyse deiner Einschränkung:</h4>
          <p className="text-white/90">{aiAnalysis}</p>
        </div>
      )}
    </div>
  );
};

export default ProblemBar;
