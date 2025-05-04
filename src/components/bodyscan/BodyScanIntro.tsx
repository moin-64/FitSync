
import React from 'react';
import { Button } from "@/components/ui/button";
import { Scan, Dumbbell, User } from 'lucide-react';

interface BodyScanIntroProps {
  onStartScan: () => void;
}

const BodyScanIntro: React.FC<BodyScanIntroProps> = ({ onStartScan }) => {
  return (
    <div className="text-center py-6 space-y-6 animate-fade-in">
      <Scan className="h-12 w-12 mx-auto mb-2 text-primary" />
      
      <div>
        <h2 className="text-2xl font-bold mb-2">3D Körperanalyse</h2>
        <p className="text-muted-foreground">
          Erstelle ein 3D-Modell deines Körpers für personalisierte Trainingspläne.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
        <div className="bg-muted rounded-lg p-4 flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3 shrink-0">
            <Scan className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">Gesamtkörperscan</h3>
            <p className="text-sm text-muted-foreground">360° Aufnahme deines Körpers</p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-4 flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3 shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">Muskelgruppenscan</h3>
            <p className="text-sm text-muted-foreground">Analyse einzelner Muskelgruppen</p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-4 flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3 shrink-0">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">KI-Trainingsplan</h3>
            <p className="text-sm text-muted-foreground">Personalisierter Plan basierend auf deiner Analyse</p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onStartScan} 
        className="min-w-[200px]"
        variant="default"
      >
        Scan starten
      </Button>
    </div>
  );
};

export default BodyScanIntro;
