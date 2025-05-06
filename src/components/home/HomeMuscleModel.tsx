
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import HumanModel from '@/components/bodyscan/HumanModel';
import ModelControls from '@/components/bodyscan/ModelControls';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { useSupabaseClient } from '@supabase/supabase-js';
import useModelControls from '@/hooks/useModelControls';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { BodyScanData } from '@/types/user';

const HomeMuscleModel = () => {
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const [bodyData, setBodyData] = useState<BodyScanData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  
  // Get control handlers from our custom hook
  const {
    handleReset,
    handleRotateLeft,
    handleRotateRight,
    handleZoomIn,
    handleZoomOut
  } = useModelControls(canvasRef);
  
  // Fetch body scan data
  useEffect(() => {
    const fetchBodyData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('body_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('scan_date', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Call edge function to analyze body scan data
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-body-scan`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: user.id }),
            }
          );
          
          if (!response.ok) throw new Error('Failed to analyze body scan');
          
          const analysisData = await response.json();
          setBodyData(analysisData);
        }
      } catch (error) {
        console.error('Error fetching body scan data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBodyData();
  }, [user?.id, supabase]);
  
  // Handle click outside to collapse the model
  useEffect(() => {
    if (!isExpanded) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Compact model display */}
      {!isExpanded && (
        <Card 
          className="w-24 h-24 sm:w-32 sm:h-32 cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
          onClick={toggleExpanded}
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-3/4 h-3/4 rounded-full" />
            </div>
          ) : (
            <Canvas className="w-full h-full">
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <ambientLight intensity={0.3} />
              <HumanModel 
                bodyData={bodyData} 
                selectedMuscleGroup={null} 
                onSelectMuscleGroup={() => {}} 
              />
            </Canvas>
          )}
        </Card>
      )}
      
      {/* Expanded floating model */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            ref={expandedRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative w-[80vw] h-[80vh] max-w-3xl bg-background rounded-lg shadow-xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="h-full w-full flex flex-col">
                <div className="flex justify-between items-center p-3 border-b">
                  <h3 className="font-medium text-lg">Muskelanalyse</h3>
                  <button 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={toggleExpanded}
                  >
                    &times;
                  </button>
                </div>
                
                <div className="flex-1 p-4 relative">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Skeleton className="w-1/2 h-3/4" />
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      <Canvas ref={canvasRef}>
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <ambientLight intensity={0.5} />
                        <HumanModel 
                          bodyData={bodyData} 
                          selectedMuscleGroup={selectedMuscleGroup} 
                          onSelectMuscleGroup={setSelectedMuscleGroup} 
                        />
                        <Environment preset="city" />
                      </Canvas>
                      
                      {/* Controls */}
                      <div className="absolute bottom-4 right-4">
                        <ModelControls 
                          onRotateLeft={handleRotateLeft}
                          onRotateRight={handleRotateRight}
                          onZoomIn={handleZoomIn}
                          onZoomOut={handleZoomOut}
                          onReset={handleReset}
                        />
                      </div>
                      
                      {/* Muscle group info */}
                      {selectedMuscleGroup && bodyData?.muscleGroups?.[selectedMuscleGroup] && (
                        <div className="absolute top-4 left-4 bg-background/90 p-3 rounded-lg border shadow-md max-w-xs">
                          <h4 className="font-medium capitalize">
                            {selectedMuscleGroup}
                          </h4>
                          <div className="mt-2 text-sm space-y-1">
                            <p>Stärke: {bodyData.muscleGroups[selectedMuscleGroup].strength}/100</p>
                            <p>Entwicklung: {bodyData.muscleGroups[selectedMuscleGroup].development}/100</p>
                            <p>Größe: {bodyData.muscleGroups[selectedMuscleGroup].size}/100</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeMuscleModel;
