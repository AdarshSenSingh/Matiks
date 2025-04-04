import { motion } from 'framer-motion';

interface DigitDisplayProps {
  digits: (number | string)[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  interactive?: boolean;
  className?: string;
  staggered?: boolean;
  staggerDelay?: number;
}

const DigitDisplay = ({
  digits,
  size = 'md',
  variant = 'primary',
  interactive = true,
  className = '',
  staggered = true,
  staggerDelay = 0.1,
}: DigitDisplayProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gray-800 text-primary-400 border-primary-700/30',
    secondary: 'bg-gray-800 text-secondary-400 border-secondary-700/30',
    accent: 'bg-gray-800 text-accent-400 border-accent-700/30',
  };
  
  // Container variants for staggered animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };
  
  // Item variants for individual digit animations
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div
      className={`flex justify-center space-x-2 ${className}`}
      variants={containerVariants}
      initial={staggered ? 'hidden' : false}
      animate="visible"
    >
      {digits.map((digit, index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-lg font-bold ${variantClasses[variant]} border shadow-lg`}
          variants={staggered ? itemVariants : undefined}
          initial={!staggered ? { opacity: 0, y: 20 } : undefined}
          animate={!staggered ? { opacity: 1, y: 0 } : undefined}
          transition={!staggered ? { delay: index * staggerDelay } : undefined}
          whileHover={interactive ? { scale: 1.1, rotate: 5, y: -5 } : undefined}
          whileTap={interactive ? { scale: 0.95 } : undefined}
        >
          {digit}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DigitDisplay;
