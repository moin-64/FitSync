
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecurityAlert = () => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="border-orange-500 bg-orange-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Sicherheitswarnung
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            Das aktuelle Authentifizierungssystem ist unsicher. 
            Wechseln Sie zum verbesserten sicheren System.
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/secure-login">
                Sicher Anmelden
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/secure-register">
                Sicher Registrieren
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityAlert;
