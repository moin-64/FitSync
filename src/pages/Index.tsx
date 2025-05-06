
import React, { useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Dumbbell, Brain, Scan } from "lucide-react";
import { motion } from 'framer-motion';

// Optimized Feature-Icon component with memoization for better performance
const FeatureIcon = memo(({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
    <Icon className="w-4 h-4" />
    <span className="text-sm">{text}</span>
  </div>
));

FeatureIcon.displayName = 'FeatureIcon';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  }
};

// Main Component with enhanced performance
const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // Memoized button components for better rendering performance
  const AuthenticatedButtons = memo(() => (
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
  ));
  
  AuthenticatedButtons.displayName = 'AuthenticatedButtons';
  
  const UnauthenticatedButtons = memo(() => (
    <>
      <Button asChild className="w-full hover:scale-[1.02] active:scale-[0.98] transition">
        <Link to="/login">Anmelden</Link>
      </Button>
      
      <Button asChild variant="outline" className="w-full hover:scale-[1.02] active:scale-[0.98] transition">
        <Link to="/register">Registrieren</Link>
      </Button>
      
      <div className="pt-4 border-t mt-6 space-y-2">
        <FeatureIcon icon={Brain} text="KI-gestützte Trainingspläne" />
        <FeatureIcon icon={Scan} text="3D Körperanalyse" />
      </div>
    </>
  ));
  
  UnauthenticatedButtons.displayName = 'UnauthenticatedButtons';
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <motion.div 
        className="max-w-md w-full bg-card/90 backdrop-blur-lg rounded-lg shadow-lg p-8 text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
          variants={itemVariants}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 10 
          }}
        >
          <Dumbbell className="w-8 h-8 text-primary" />
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-bold mb-4 gradient-text animate-tracking-in"
          variants={itemVariants}
        >
          Willkommen bei FitSync
        </motion.h1>
        
        <motion.p 
          className="text-lg text-gray-300 mb-8"
          variants={itemVariants}
        >
          Dein intelligenter Trainingsbegleiter für ein effektives Fitnesserlebnis.
        </motion.p>
        
        <motion.div 
          className="space-y-4"
          variants={itemVariants}
        >
          {isAuthenticated ? <AuthenticatedButtons /> : <UnauthenticatedButtons />}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Export with React.memo for optimized rendering
export default memo(Index);
