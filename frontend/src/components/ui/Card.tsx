import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({ children, className = '', hover = false, onClick }: CardProps) => {
  const baseClasses = 'bg-white rounded-xl shadow-md overflow-hidden';
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${clickClasses} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white ${className}`}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>{children}</div>;
};

export default Card;
