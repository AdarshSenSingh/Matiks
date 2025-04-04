import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  yOffset?: number;
  xOffset?: number;
  rotation?: number;
  className?: string;
}

const FloatingElement = ({
  children,
  duration = 3,
  delay = 0,
  yOffset = 10,
  xOffset = 0,
  rotation = 0,
  className = '',
}: FloatingElementProps) => {
  return (
    <motion.div
      className={className}
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{
        y: [0, -yOffset, 0],
        x: [0, xOffset, 0],
        rotate: [0, rotation, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
