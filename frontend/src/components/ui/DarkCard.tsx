import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DarkCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  hover?: boolean;
  glow?: boolean;
  border?: boolean;
  onClick?: () => void;
}

const DarkCard = ({
  children,
  className = '',
  variant = 'primary',
  hover = false,
  glow = false,
  border = true,
  onClick,
}: DarkCardProps) => {
  // Base classes
  const baseClasses = 'rounded-xl overflow-hidden backdrop-blur-sm';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-gray-900/90 text-white',
    secondary: 'bg-gray-900/90 text-white',
    accent: 'bg-gray-900/90 text-white',
    neutral: 'bg-gray-900/90 text-white',
  };
  
  // Border classes
  const borderClasses = border ? {
    primary: 'border border-primary-500/30',
    secondary: 'border border-secondary-500/30',
    accent: 'border border-accent-500/30',
    neutral: 'border border-gray-700/50',
  } : {
    primary: '',
    secondary: '',
    accent: '',
    neutral: '',
  };
  
  // Glow classes
  const glowClasses = glow ? {
    primary: 'shadow-lg shadow-primary-500/10',
    secondary: 'shadow-lg shadow-secondary-500/10',
    accent: 'shadow-lg shadow-accent-500/10',
    neutral: 'shadow-lg shadow-gray-700/10',
  } : {
    primary: '',
    secondary: '',
    accent: '',
    neutral: '',
  };
  
  // Hover classes
  const hoverClasses = hover ? 'transition-all duration-300 hover:-translate-y-1' : '';
  
  // Click classes
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  // Combine all classes
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${borderClasses[variant]} ${glowClasses[variant]} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export const DarkCardHeader = ({ 
  children, 
  className = '',
  variant = 'primary',
  withAccent = true,
}: { 
  children: ReactNode; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  withAccent?: boolean;
}) => {
  const accentClasses = withAccent ? {
    primary: 'border-l-4 border-primary-500',
    secondary: 'border-l-4 border-secondary-500',
    accent: 'border-l-4 border-accent-500',
    neutral: '',
  } : {
    primary: '',
    secondary: '',
    accent: '',
    neutral: '',
  };
  
  return (
    <div className={`p-6 border-b border-gray-800 ${accentClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const DarkCardBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const DarkCardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 border-t border-gray-800 ${className}`}>{children}</div>;
};

export default DarkCard;
