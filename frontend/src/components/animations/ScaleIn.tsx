import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  className?: string;
}

const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.5,
  initialScale = 0.9,
  className = '',
}: ScaleInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
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

export default ScaleIn;
