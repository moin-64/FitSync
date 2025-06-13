
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSecureAuth } from '@/context/SecureAuthContext';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

const ConnectionStatus = () => {
  const { connectionHealthy } = useSecureAuth();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkSupabaseConnection();
      window.location.reload();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  if (connectionHealthy) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Alert variant="destructive" className="border-red-500 bg-red-50">
        <WifiOff className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Verbindungsproblem
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            Die Verbindung zum Server ist fehlgeschlagen. 
            Bitte überprüfen Sie Ihre Internetverbindung.
          </p>
          <Button 
            size="sm" 
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verbindung wird wiederhergestellt...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Erneut versuchen
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionStatus;
