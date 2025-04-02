
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';

interface ProblemBarProps {
  onLimitationAdded?: (limitation: string) => void;
}

const ProblemBar: React.FC<ProblemBarProps> = ({ onLimitationAdded }) => {
  const [limitation, setLimitation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addLimitation } = useUser();
  const { toast } = useToast();

  // Initialize Supabase client for calling edge functions
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const handleSubmit = async () => {
    if (!limitation.trim()) return;
    
    try {
      setSubmitting(true);

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
      } else if (data?.result) {
        // Show the AI analysis as a toast
        toast({
          title: "Limitation Analysis",
          description: data.result.substring(0, 255) + (data.result.length > 255 ? "..." : ""),
        });
      }
      
      // Add the limitation to the user profile
      await addLimitation(limitation);
      
      if (onLimitationAdded) {
        onLimitationAdded(limitation);
      }
      
      setLimitation('');
    } catch (error) {
      console.error('Failed to add limitation:', error);
      toast({
        title: "Error",
        description: "Failed to add limitation",
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
        <Input
          type="text"
          placeholder="Describe any limitations you have today (e.g., injured wrist, sore back)"
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
    </div>
  );
};

export default ProblemBar;
