
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSecureAuth } from '@/context/SecureAuthContext';
import { checkSupabaseConnection, runNetworkDiagnostics } from '@/integrations/supabase/client';

const ConnectionStatus = () => {
  const { connectionHealthy } = useSecureAuth();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [isDiagnosing, setIsDiagnosing] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      console.log('🔄 Manual connection retry initiated...');
      const isHealthy = await checkSupabaseConnection();
      if (isHealthy) {
        console.log('✅ Connection restored, reloading page...');
        window.location.reload();
      } else {
        console.warn('⚠️ Connection still unhealthy after retry');
      }
    } catch (error) {
      console.error('💥 Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      await runNetworkDiagnostics();
      console.log('🔧 Diagnostics completed - check console for details');
    } catch (error) {
      console.error('🔧 Diagnostics failed:', error);
    } finally {
      setIsDiagnosing(false);
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
          <AlertTriangle className="h-4 w-4" />
          Verbindungsproblem erkannt
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            Die Verbindung zu Supabase ist fehlgeschlagen. Dies kann an Netzwerkproblemen 
            oder temporären Serverproblemen liegen.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              onClick={handleRetry}
              disabled={isRetrying || isDiagnosing}
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
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleDiagnostics}
              disabled={isRetrying || isDiagnosing}
              className="w-full"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Diagnose läuft...
                </>
              ) : (
                'Netzwerk-Diagnose'
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionStatus;
