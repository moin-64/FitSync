
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-primary">Willkommen bei Ihrer Fitness-App</h1>
        <p className="text-lg text-gray-600 mb-8">Beginnen Sie Ihre Fitnessreise hier und erreichen Sie Ihre persönlichen Ziele.</p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login">Anmelden</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/register">Registrieren</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
