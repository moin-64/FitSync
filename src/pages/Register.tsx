
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Create a schema for form validation
const registerSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen enthalten"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen enthalten"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Create form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  // Clear error when form values change
  useEffect(() => {
    if (errorMessage && form.formState.isDirty) {
      setErrorMessage(null);
    }
  }, [form.formState.isDirty, errorMessage]);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setErrorMessage(null);
      setIsLoading(true);
      
      // Account creation with timeout to prevent hanging
      const registerPromise = register(values.username, values.email, values.password);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Registrierung hat zu lange gedauert')), 15000);
      });
      
      await Promise.race([registerPromise, timeoutPromise]);
      navigate('/onboarding');
    } catch (error) {
      console.error('Registrierung fehlgeschlagen:', error);
      
      let message = 'Es gab ein Problem bei der Erstellung Ihres Kontos';
      if (error instanceof Error) {
        if (error.message.includes('E-Mail existiert bereits')) {
          message = 'Diese E-Mail-Adresse wird bereits verwendet';
        } else if (error.message.includes('zu lange gedauert')) {
          message = 'Die Registrierung hat zu lange gedauert. Bitte versuchen Sie es erneut.';
        } else {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background animate-page-transition-in">
      <Link to="/login" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      
      <Card className="glass w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Konto erstellen</CardTitle>
          <CardDescription className="text-center">
            Beginnen Sie Ihre persönliche Fitnessreise mit FitSync
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label htmlFor="username">Benutzername</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          id="username"
                          type="text"
                          placeholder="maxmustermann"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="username"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@beispiel.com"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label htmlFor="password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="pl-10"
                          disabled={isLoading}
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Konto wird erstellt...
                  </>
                ) : (
                  'Konto erstellen'
                )}
              </Button>
              
              <div className="text-center text-sm">
                Haben Sie bereits ein Konto?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Anmelden
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
