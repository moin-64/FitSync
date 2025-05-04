
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import BodyModelViewer from '@/components/bodyscan/BodyModelViewer';
import MuscleGroupInfo from '@/components/bodyscan/MuscleGroupInfo';

interface BodyScanResultsProps {
  bodyData: any;
}

const BodyScanResults: React.FC<BodyScanResultsProps> = ({ bodyData }) => {
  const navigate = useNavigate();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="model">3D Modell</TabsTrigger>
          <TabsTrigger value="data">Messdaten</TabsTrigger>
        </TabsList>
        
        <TabsContent value="model" className="py-4">
          <div className="bg-muted rounded-lg p-4">
            {bodyData ? (
              <BodyModelViewer 
                bodyData={bodyData}
                selectedMuscleGroup={selectedMuscleGroup}
                onSelectMuscleGroup={setSelectedMuscleGroup}
              />
            ) : (
              <Skeleton className="w-full aspect-square rounded-md" />
            )}
          </div>
          
          {selectedMuscleGroup && bodyData?.muscleGroups[selectedMuscleGroup] && (
            <MuscleGroupInfo 
              muscleGroup={selectedMuscleGroup} 
              muscleData={bodyData?.muscleGroups[selectedMuscleGroup]}
            />
          )}
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            {bodyData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Alter</p>
                    <p className="text-2xl font-bold">{bodyData.age} Jahre</p>
                  </div>
                  <div className="bg-background p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Größe</p>
                    <p className="text-2xl font-bold">{bodyData.height} cm</p>
                  </div>
                  <div className="bg-background p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Gewicht</p>
                    <p className="text-2xl font-bold">{bodyData.weight} kg</p>
                  </div>
                  <div className="bg-background p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">Körperfett</p>
                    <p className="text-2xl font-bold">{bodyData.bodyFat}%</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium pt-4">Muskelgruppen-Details</h3>
                <div className="space-y-2">
                  {bodyData.muscleGroups && Object.entries(bodyData.muscleGroups).map(([muscle, data]: [string, any]) => (
                    <Button 
                      key={muscle}
                      variant="outline" 
                      className="w-full justify-between"
                      onClick={() => setSelectedMuscleGroup(muscle)}
                    >
                      <span className="capitalize">{muscle}</span>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">Entwicklung: {data.development}%</span>
                        <Info className="h-4 w-4" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={() => navigate('/create-workout')}
          variant="default"
          className="min-w-[250px]"
        >
          Personalisierten Trainingsplan erstellen
        </Button>
      </div>
    </div>
  );
};

export default BodyScanResults;
