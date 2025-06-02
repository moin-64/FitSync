
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Shield, Users, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">FitSync</h1>
          </div>
          <div className="space-x-2">
            <Button asChild variant="outline">
              <Link to="/secure-login">Anmelden</Link>
            </Button>
            <Button asChild>
              <Link to="/secure-register">Registrieren</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Ihre sichere Fitness-App
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trainieren Sie sicher mit erweiterten Sicherheitsfeatures und personalisierten Workouts
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/secure-register">Jetzt starten</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/secure-login">Anmelden</Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Maximale Sicherheit</CardTitle>
              <CardDescription>
                Erweiterte Verschlüsselung und sichere Authentifizierung schützen Ihre Daten
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Social Features</CardTitle>
              <CardDescription>
                Trainieren Sie mit Freunden und teilen Sie Ihre Fortschritte sicher
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Detaillierte Analytics</CardTitle>
              <CardDescription>
                Verfolgen Sie Ihren Fortschritt mit umfassenden Statistiken
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
