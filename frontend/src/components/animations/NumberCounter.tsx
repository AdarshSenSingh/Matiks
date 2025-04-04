import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface NumberCounterProps {
  value: number;
  duration?: number;
  formatFn?: (value: number) => string;
  className?: string;
  animateOnChange?: boolean;
  animateOnMount?: boolean;
}

const NumberCounter = ({
  value,
  duration = 1.5,
  formatFn = (val) => val.toString(),
  className = '',
  animateOnChange = true,
  animateOnMount = true,
}: NumberCounterProps) => {
  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : value);
  const prevValueRef = useRef(animateOnMount ? 0 : value);
  const controls = useAnimation();

  useEffect(() => {
    if (value !== prevValueRef.current) {
      if (animateOnChange) {
        // Animate from previous value to new value
        const startValue = prevValueRef.current;
        const endValue = value;
        const range = endValue - startValue;
        
        let startTime: number;
        const step = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
          const easedProgress = easeOutExpo(progress);
          const currentValue = startValue + range * easedProgress;
          
          setDisplayValue(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            setDisplayValue(endValue);
          }
        };
        
        requestAnimationFrame(step);
        
        // Animate the container
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.4 }
        });
      } else {
        setDisplayValue(value);
      }
      
      prevValueRef.current = value;
    }
  }, [value, duration, animateOnChange, controls]);

  // Easing function for smooth animation
  const easeOutExpo = (x: number): number => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  };

  return (
    <motion.span 
      className={className}
      animate={controls}
    >
      {formatFn(Math.round(displayValue))}
    </motion.span>
  );
};

export default NumberCounter;
