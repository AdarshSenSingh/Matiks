import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const ProgressBar = ({
  progress,
  color = 'bg-primary-600',
  height = 8,
  showPercentage = false,
  label,
  animated = true,
  className = '',
}: ProgressBarProps) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-500">{clampedProgress.toFixed(0)}%</span>
          )}
        </div>
      )}
      
      <div 
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: animated ? 0.5 : 0,
            ease: 'easeOut'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
