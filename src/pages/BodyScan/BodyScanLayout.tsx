
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface BodyScanLayoutProps {
  children: React.ReactNode;
  title: string;
  onBack: () => void;
}

const BodyScanLayout: React.FC<BodyScanLayoutProps> = ({ children, title, onBack }) => {
  return (
    <div className="min-h-screen bg-background animate-page-transition-in">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default BodyScanLayout;
