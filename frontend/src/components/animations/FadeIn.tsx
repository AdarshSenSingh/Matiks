import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
}

const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  className = '',
}: FadeInProps) => {
  // Set initial and animate values based on direction
  let initial = { opacity: 0 };
  
  if (direction === 'up') {
    initial = { ...initial, y: distance };
  } else if (direction === 'down') {
    initial = { ...initial, y: -distance };
  } else if (direction === 'left') {
    initial = { ...initial, x: distance };
  } else if (direction === 'right') {
    initial = { ...initial, x: -distance };
  }

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for a smooth easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
