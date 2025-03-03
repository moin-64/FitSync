
import { useState, useRef, useEffect } from 'react';
import { useToast } from './use-toast';

interface UseAudioAnalysisProps {
  isRecording: boolean;
  onStruggleDetected: () => void;
  onStruggleResolved: () => void;
}

export const useAudioAnalysis = ({ 
  isRecording, 
  onStruggleDetected,
  onStruggleResolved 
}: UseAudioAnalysisProps) => {
  const { toast } = useToast();
  const [struggleDetected, setStruggleDetected] = useState(false);
  
  // Audio analysis state
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  
  // Setup audio context and analyzer for detecting struggle
  useEffect(() => {
    if (isRecording) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }
    
    return () => {
      stopAudioAnalysis();
    };
  }, [isRecording]);
  
  const startAudioAnalysis = async () => {
    try {
      // Request microphone access
      micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context and analyzer
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      const microphone = audioContext.current.createMediaStreamSource(micStream.current);
      microphone.connect(analyser.current);
      
      // Create media recorder
      mediaRecorder.current = new MediaRecorder(micStream.current);
      mediaRecorder.current.start();
      
      // Set up analysis interval
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const analyzeAudio = () => {
        if (!analyser.current || !isRecording) return;
        
        analyser.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Detect struggle based on volume threshold
        // Higher volume might indicate struggle or strain
        if (average > 150) {
          if (!struggleDetected) {
            setStruggleDetected(true);
            onStruggleDetected();
            toast({
              title: "Potential struggle detected",
              description: "Consider reducing intensity or taking a break",
              variant: "destructive",
            });
          }
        } else {
          if (struggleDetected) {
            setStruggleDetected(false);
            onStruggleResolved();
          }
        }
        
        if (isRecording) {
          requestAnimationFrame(analyzeAudio);
        }
      };
      
      analyzeAudio();
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Audio analysis will not be available for this workout",
        variant: "destructive",
      });
    }
  };
  
  const stopAudioAnalysis = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    
    if (micStream.current) {
      micStream.current.getTracks().forEach(track => track.stop());
      micStream.current = null;
    }
    
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close();
    }
    
    analyser.current = null;
    audioContext.current = null;
  };

  return {
    struggleDetected,
    stopAudioAnalysis
  };
};
