
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, retryAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage('Bitte geben Sie E-Mail und Passwort ein');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (error) {
      console.error('Anmeldung fehlgeschlagen:', error);
      setErrorMessage('Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      await retryAuth();
      if (localStorage.getItem('user')) {
        navigate('/home');
        toast({
          title: 'Erfolgreich wiederhergestellt',
          description: 'Ihre Sitzung wurde erfolgreich wiederhergestellt',
        });
      }
    } catch (error) {
      console.error('Fehler bei der erneuten Authentifizierung:', error);
      toast({
        title: 'Wiederherstellung fehlgeschlagen',
        description: 'Bitte melden Sie sich erneut an',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isLoading}
            >
              {isLoading ? 'Anmelden...' : 'Anmelden'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleRetry}
              disabled={isLoading}
            >
              Sitzung wiederherstellen
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
