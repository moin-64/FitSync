
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSecureAuth } from '../context/SecureAuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Benutzername muss mindestens 3 Zeichen enthalten"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string()
    .min(8, "Passwort muss mindestens 8 Zeichen enthalten")
    .regex(/[A-Z]/, "Passwort muss einen Großbuchstaben enthalten")
    .regex(/[a-z]/, "Passwort muss einen Kleinbuchstaben enthalten")
    .regex(/\d/, "Passwort muss eine Zahl enthalten")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Passwort muss ein Sonderzeichen enthalten"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const SecureRegister = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signUp, loading } = useSecureAuth();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  useEffect(() => {
    if (errorMessage && form.formState.isDirty) {
      setErrorMessage(null);
    }
  }, [form.formState.isDirty, errorMessage]);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setErrorMessage(null);
      await signUp(values.email, values.password, values.username);
    } catch (error) {
      let message = 'Es gab ein Problem bei der Erstellung Ihres Kontos';
      if (error instanceof Error) {
        message = error.message;
      }
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Link to="/secure-login" className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-6 w-6" />
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sicheres Konto erstellen</CardTitle>
          <CardDescription className="text-center">
            Registrieren Sie sich mit erweiterten Sicherheitsfeatures
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
                          disabled={loading}
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
                          disabled={loading}
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
                          disabled={loading}
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
                          disabled={loading}
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
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Konto wird erstellt...
                  </>
                ) : (
                  'Sicheres Konto erstellen'
                )}
              </Button>
              
              <div className="text-center text-sm">
                Haben Sie bereits ein Konto?{' '}
                <Link to="/secure-login" className="text-primary hover:underline">
                  Sicher Anmelden
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SecureRegister;
