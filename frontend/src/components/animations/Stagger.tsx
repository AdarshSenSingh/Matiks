import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StaggerProps {
  children: ReactNode[];
  delay?: number;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
}

const Stagger = ({
  children,
  delay = 0,
  staggerDelay = 0.1,
  direction = 'up',
  distance = 20,
  className = '',
}: StaggerProps) => {
  // Set initial values based on direction
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: initial,
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for a smooth easing
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Stagger;
