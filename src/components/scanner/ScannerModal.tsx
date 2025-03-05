
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface ScannerModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ 
  title,
  onClose,
  children
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-card border border-border shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
