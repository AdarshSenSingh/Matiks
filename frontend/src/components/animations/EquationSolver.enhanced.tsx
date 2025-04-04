import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface EquationSolverProps {
  equation: string;
  steps: string[];
  result: string;
  duration?: number;
  stepDuration?: number;
  className?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
  showReplayButton?: boolean;
  highlightColor?: string;
}

const EquationSolverEnhanced = ({
  equation,
  steps,
  result,
  duration = 5,
  stepDuration = 1.5,
  className = '',
  onComplete,
  autoPlay = true,
  showReplayButton = true,
  highlightColor = 'text-primary-400',
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

  // Format the equation with highlighted operations
  const formatEquation = (eq: string) => {
    // Replace operations with highlighted spans
    return eq.replace(/([+\-*/()^×÷])/g, `<span class="${highlightColor}">$1</span>`);
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
            className="text-center p-2"
            dangerouslySetInnerHTML={{ __html: formatEquation(equation) }}
          />
        )}
        
        {currentStep === 0 && (
          <motion.div
            key="equation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-2"
            dangerouslySetInnerHTML={{ __html: formatEquation(equation) }}
          />
        )}
        
        {currentStep > 0 && currentStep <= steps.length && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-2"
            dangerouslySetInnerHTML={{ __html: formatEquation(steps[currentStep - 1]) }}
          />
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
            className="text-center font-bold p-2"
            dangerouslySetInnerHTML={{ __html: formatEquation(result) }}
          />
        )}
      </AnimatePresence>
      
      {isComplete && showReplayButton && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-center"
        >
          <button
            onClick={handleReplay}
            className={`inline-flex items-center text-sm ${highlightColor} hover:opacity-80 transition-opacity`}
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Replay
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default EquationSolverEnhanced;
