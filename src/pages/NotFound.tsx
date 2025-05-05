
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md glass p-8 rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
        <p className="text-xl mb-6">Diese Seite existiert nicht</p>
        <p className="text-muted-foreground mb-8">
          Die angeforderte Seite konnte nicht gefunden werden.
        </p>
        
        <Button asChild className="w-full">
          <Link to={isAuthenticated ? "/home" : "/"}>
            Zurück zur {isAuthenticated ? "Startseite" : "Anmeldeseite"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
