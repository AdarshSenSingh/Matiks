import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';

interface CountdownTimerProps {
  initialTime: number; // in seconds
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  warningThreshold?: number; // time in seconds when to start warning color
  dangerThreshold?: number; // time in seconds when to start danger color
}

const CountdownTimer = ({
  initialTime,
  onComplete,
  size = 'md',
  showIcon = true,
  className = '',
  warningThreshold = 30,
  dangerThreshold = 10,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get color based on time left
  const getColor = useCallback(() => {
    if (timeLeft <= dangerThreshold) return 'text-red-600';
    if (timeLeft <= warningThreshold) return 'text-yellow-600';
    return 'text-green-600';
  }, [timeLeft, warningThreshold, dangerThreshold]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'lg':
        return 'text-3xl';
      case 'md':
      default:
        return 'text-xl';
    }
  };

  // Countdown effect
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onComplete]);

  // Calculate progress percentage
  const progressPercentage = (timeLeft / initialTime) * 100;

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && (
        <ClockIcon className={`h-5 w-5 mr-2 ${getColor()}`} />
      )}
      
      <div className="relative">
        <motion.span
          className={`font-bold ${getSizeClasses()} ${getColor()}`}
          key={timeLeft}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(timeLeft)}
        </motion.span>
        
        {/* Circular progress indicator */}
        {size === 'lg' && (
          <svg className="absolute -inset-1" viewBox="0 0 100 100" width="100%" height="100%">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (301.59 * progressPercentage) / 100}
              className={getColor()}
              transform="rotate(-90 50 50)"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
