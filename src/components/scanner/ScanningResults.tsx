
import React from 'react';
import { Button } from "@/components/ui/button";

interface ScanningResultsProps {
  analyzing: boolean;
  result: string | null;
  error: string | null;
  onRetry: () => void;
}

const ScanningResults: React.FC<ScanningResultsProps> = ({
  analyzing,
  result,
  error,
  onRetry
}) => {
  if (analyzing) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Analyzing workout plan...</p>
      </div>
    );
  }
  
  if (result) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mb-2 font-medium">{result}</p>
        <p className="text-sm text-muted-foreground">Redirecting to your workout...</p>
      </div>
    );
  }
  
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
        <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <p className="mb-4">{error || 'Failed to analyze the workout plan.'}</p>
      <Button onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
};

export default ScanningResults;
