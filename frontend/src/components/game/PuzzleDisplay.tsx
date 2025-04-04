import { motion } from 'framer-motion';

interface PuzzleDisplayProps {
  puzzle: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const PuzzleDisplay = ({
  puzzle,
  size = 'md',
  animated = true,
  className = '',
}: PuzzleDisplayProps) => {
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'space-x-2',
          digit: 'w-10 h-10 text-lg',
        };
      case 'lg':
        return {
          container: 'space-x-4',
          digit: 'w-16 h-16 text-3xl',
        };
      case 'md':
      default:
        return {
          container: 'space-x-3',
          digit: 'w-14 h-14 text-2xl',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Container variants for staggered animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Item variants for individual digit animations
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <motion.div
      className={`flex justify-center ${sizeClasses.container} ${className}`}
      variants={containerVariants}
      initial={animated ? 'hidden' : 'visible'}
      animate="visible"
    >
      {puzzle.split('').map((digit, index) => (
        <motion.div
          key={index}
          className={`${sizeClasses.digit} flex items-center justify-center bg-primary-100 rounded-lg font-bold text-primary-800 shadow-sm`}
          variants={itemVariants}
          transition={{ duration: 0.3 }}
          whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
        >
          {digit}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PuzzleDisplay;
