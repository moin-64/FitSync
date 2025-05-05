import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, retryAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fehler bei Eingabeänderung löschen
  useEffect(() => {
    if (errorMessage && (email || password)) {
      setErrorMessage(null);
    }
  }, [email, password, errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Eingabevalidierung
    if (!email.trim() || !password) {
      setErrorMessage('Bitte geben Sie E-Mail und Passwort ein');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Verkürzte Timeout-Zeit für schnellere Reaktion
      const loginPromise = login(email.trim(), password);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Anmeldevorgang hat zu lange gedauert')), 5000);
      });
      
      await Promise.race([loginPromise, timeoutPromise]);
      navigate('/home');
    } catch (error) {
      console.error('Anmeldung fehlgeschlagen:', error);
      
      let message = 'Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut';
      if (error instanceof Error) {
        if (error.message.includes('zu lange gedauert')) {
          message = 'Der Anmeldevorgang hat zu lange gedauert. Bitte versuchen Sie es erneut.';
        }
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      setErrorMessage(null);
      
      // Verkürzte Timeout-Zeit
      const retryPromise = retryAuth();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Wiederherstellungsversuch hat zu lange gedauert')), 4000);
      });
      
      await Promise.race([retryPromise, timeoutPromise]);
      
      // Check if localStorage has user data after retry
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        navigate('/home');
        toast({
          title: 'Erfolgreich wiederhergestellt',
          description: 'Ihre Sitzung wurde erfolgreich wiederhergestellt',
        });
      } else {
        setErrorMessage('Sitzung konnte nicht wiederhergestellt werden');
      }
    } catch (error) {
      console.error('Fehler bei der erneuten Authentifizierung:', error);
      
      setErrorMessage('Die Wiederherstellung der Sitzung ist fehlgeschlagen');
      
      toast({
        title: 'Wiederherstellung fehlgeschlagen',
        description: 'Bitte melden Sie sich erneut an',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background animate-page-transition-in">
      <Link to="/" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      
      <Card className="glass w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Willkommen zurück</CardTitle>
          <CardDescription className="text-center">
            Geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen
          </CardDescription>
        </CardHeader>
        
        {errorMessage && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || isRetrying}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link 
                  to="#" 
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: 'Passwort-Reset',
                      description: 'Diese Funktion wird in Kürze verfügbar sein.',
                    });
                  }}
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || isRetrying}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isLoading || isRetrying}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsRetrying(true);
                setErrorMessage(null);
                
                // Verkürzte Timeout-Zeit
                const retryPromise = retryAuth();
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => reject(new Error('Wiederherstellungsversuch hat zu lange gedauert')), 4000);
                });
                
                Promise.race([retryPromise, timeoutPromise])
                  .then(() => {
                    const storedUser = localStorage.getItem('user');
                    
                    if (storedUser) {
                      navigate('/home');
                      toast({
                        title: 'Erfolgreich wiederhergestellt',
                        description: 'Ihre Sitzung wurde erfolgreich wiederhergestellt',
                      });
                    } else {
                      setErrorMessage('Sitzung konnte nicht wiederhergestellt werden');
                    }
                  })
                  .catch((error) => {
                    console.error('Fehler bei der erneuten Authentifizierung:', error);
                    setErrorMessage('Die Wiederherstellung der Sitzung ist fehlgeschlagen');
                  })
                  .finally(() => {
                    setIsRetrying(false);
                  });
              }}
              disabled={isLoading || isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Versuche wiederherzustellen...
                </>
              ) : (
                'Sitzung wiederherstellen'
              )}
            </Button>
            
            <div className="text-center text-sm">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Erstellen Sie eines
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
