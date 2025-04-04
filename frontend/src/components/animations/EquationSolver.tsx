import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EquationSolverProps {
  equation: string;
  steps: string[];
  result: string;
  duration?: number;
  stepDuration?: number;
  className?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
}

const EquationSolver = ({
  equation,
  steps,
  result,
  duration = 5,
  stepDuration = 1,
  className = '',
  onComplete,
  autoPlay = true,
}: EquationSolverProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    
    // Start with the initial equation
    setCurrentStep(0);
    
    // Progress through steps
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        
        // Check if we've reached the end
        if (next >= steps.length + 1) {
          clearInterval(timer);
          setIsComplete(true);
          setIsPlaying(false);
          onComplete?.();
          return prev;
        }
        
        return next;
      });
    }, stepDuration * 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, stepDuration, onComplete]);

  const handleReplay = () => {
    setIsComplete(false);
    setCurrentStep(-1);
    setIsPlaying(true);
  };

  return (
    <div className={`font-mono ${className}`}>
      <AnimatePresence mode="wait">
        {currentStep === -1 && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {equation}
          </motion.div>
        )}
        
        {currentStep === 0 && (
          <motion.div
            key="equation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            {equation}
          </motion.div>
        )}
        
        {currentStep > 0 && currentStep <= steps.length && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            {steps[currentStep - 1]}
          </motion.div>
        )}
        
        {currentStep > steps.length && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20
              }
            }}
            className="text-center font-bold"
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
      
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <button
            onClick={handleReplay}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Replay
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default EquationSolver;
