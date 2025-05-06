
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const Welcome = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Check if user has already seen welcome page
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome) {
      navigate('/login');
      return;
    }
    
    // Mark welcome page as seen
    localStorage.setItem('hasSeenWelcome', 'true');
    
    // Animate in after short delay - optimized for performance
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const handleContinue = () => {
    navigate('/login');
  };
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <motion.div
        className="max-w-md w-full"
        initial="hidden"
        animate={loaded ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative inline-block mb-6">
            <motion.div 
              className="w-24 h-24 bg-primary rounded-full mb-4 mx-auto"
              animate={{ 
                boxShadow: ["0 0 0 rgba(99, 102, 241, 0.4)", "0 0 20px rgba(99, 102, 241, 0.8)", "0 0 0 rgba(99, 102, 241, 0.4)"],
              }}
              transition={{ 
                duration: 2, 
                ease: "easeInOut", 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.svg 
                width="50" height="50" viewBox="0 0 24 24" fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.5, 
                  type: "spring", 
                  stiffness: 200,
                  damping: 15
                }}
              >
                <path d="M6.34315 17.6569C5.22433 16.538 4.4624 15.1126 4.15372 13.5694C3.84504 12.0262 4.00346 10.4272 4.60896 8.98623C5.21446 7.54529 6.23984 6.32978 7.55544 5.47905C8.87103 4.62831 10.4178 4.18687 12 4.18687C13.5822 4.18687 15.129 4.62831 16.4446 5.47905C17.7602 6.32978 18.7855 7.54529 19.391 8.98623C19.9965 10.4272 20.155 12.0262 19.8463 13.5694C19.5376 15.1126 18.7757 16.538 17.6569 17.6569" 
                  stroke="#121826" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L16 8" stroke="#121826" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            </div>
          </div>
          
          <motion.h1 
            className="text-4xl font-bold mb-2 gradient-text"
            variants={itemVariants}
          >
            FitSync
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mb-8"
            variants={itemVariants}
          >
            Dein persönlicher KI-Fitness-Begleiter
          </motion.p>
          
          <motion.div 
            className="glass-enhanced p-6 rounded-lg mb-8"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.h2 
              className="text-xl font-bold mb-4"
              variants={itemVariants}
            >
              Personalisiertes Training
            </motion.h2>
            <motion.p 
              className="text-sm mb-6"
              variants={itemVariants}
            >
              FitSync passt sich an dein Fitnessniveau, deine Ziele und Einschränkungen an, um
              personalisierte Trainingspläne zu erstellen, die sich mit dir weiterentwickeln.
            </motion.p>
            
            <motion.div 
              className="grid grid-cols-2 gap-4 text-center"
              variants={itemVariants}
            >
              <motion.div 
                className="p-3"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  y: -5
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center mx-auto mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.25 6.375C20.25 8.65317 16.5563 10.5 12 10.5C7.44365 10.5 3.75 8.65317 3.75 6.375M20.25 6.375C20.25 4.09683 16.5563 2.25 12 2.25C7.44365 2.25 3.75 4.09683 3.75 6.375M20.25 6.375V17.625C20.25 19.9032 16.5563 21.75 12 21.75C7.44365 21.75 3.75 19.9032 3.75 17.625V6.375M20.25 12C20.25 14.2782 16.5563 16.125 12 16.125C7.44365 16.125 3.75 14.2782 3.75 12" 
                      stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-sm font-medium">KI-gestützt</h3>
              </motion.div>
              
              <motion.div 
                className="p-3"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  y: -5
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center mx-auto mb-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12.75L11.25 15L15 9.75M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-sm font-medium">Sicher</h3>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button
            onClick={handleContinue}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all btn-ripple"
            size="lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Los geht's
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
