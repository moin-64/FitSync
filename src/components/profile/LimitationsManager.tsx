
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';

interface LimitationsManagerProps {
  limitations: string[];
  addLimitation: (limitation: string) => Promise<void>;
  removeLimitation: (limitation: string) => Promise<void>;
}

const LimitationsManager = ({ limitations, addLimitation, removeLimitation }: LimitationsManagerProps) => {
  const [newLimitation, setNewLimitation] = useState('');
  
  const handleAddLimitation = async () => {
    if (!newLimitation.trim()) return;
    
    try {
      await addLimitation(newLimitation.trim());
      setNewLimitation('');
    } catch (error) {
      console.error('Failed to add limitation:', error);
    }
  };
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Limitations & Injuries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {limitations.length > 0 ? (
              limitations.map((limitation) => (
                <Badge key={limitation} variant="secondary" className="pl-3 pr-2 py-1.5 text-sm flex items-center gap-1">
                  {limitation}
                  <button 
                    onClick={() => removeLimitation(limitation)}
                    className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No limitations added yet.</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newLimitation}
              onChange={(e) => setNewLimitation(e.target.value)}
              placeholder="Add a new limitation or injury"
              onKeyDown={(e) => e.key === 'Enter' && handleAddLimitation()}
            />
            <Button onClick={handleAddLimitation} type="button">Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LimitationsManager;
