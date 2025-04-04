import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'none' | 'sm' | 'md' | 'lg';
  opacity?: number;
  border?: boolean;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard = ({
  children,
  className = '',
  blur = 'md',
  opacity = 0.7,
  border = true,
  glow = false,
  hover = false,
  onClick,
}: GlassCardProps) => {
  // Blur classes
  const blurClasses = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };
  
  // Base classes
  const baseClasses = `
    bg-white/[${opacity}] 
    ${blurClasses[blur]} 
    rounded-xl 
    overflow-hidden 
    ${border ? 'border border-white/20' : ''} 
    ${glow ? 'shadow-lg shadow-white/10' : ''}
    ${hover ? 'transition-all duration-300 hover:shadow-xl hover:shadow-white/20' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;
  
  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
};

export const GlassCardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`p-6 border-b border-white/10 ${className}`}>
      {children}
    </div>
  );
};

export const GlassCardBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const GlassCardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 border-t border-white/10 ${className}`}>{children}</div>;
};

export default GlassCard;
