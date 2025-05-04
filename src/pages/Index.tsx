
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Dumbbell, Brain, Scan } from "lucide-react";
import { memo } from "react";

// Optimierte Feature-Icon Komponente
const FeatureIcon = memo(({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
    <Icon className="w-4 h-4" />
    <span className="text-sm">{text}</span>
  </div>
));

FeatureIcon.displayName = 'FeatureIcon';

// Main Component
const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Dumbbell className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-primary">Willkommen bei FitSync</h1>
        <p className="text-lg text-gray-600 mb-8">Dein intelligenter Trainingsbegleiter für ein effektives Fitnesserlebnis.</p>
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              <Button asChild className="w-full group">
                <Link to="/home">
                  Zum Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/bodyscan" className="flex items-center justify-center">
                  <Scan className="mr-2 h-4 w-4" />
                  3D Körperscan starten
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link to="/login">Anmelden</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/register">Registrieren</Link>
              </Button>
              
              <div className="pt-4 border-t mt-6 space-y-2">
                <FeatureIcon icon={Brain} text="KI-gestützte Trainingspläne" />
                <FeatureIcon icon={Scan} text="3D Körperanalyse" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
