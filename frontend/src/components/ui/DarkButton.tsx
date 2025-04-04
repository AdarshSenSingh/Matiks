import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DarkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
  className?: string;
}

const DarkButton = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  glow = true,
  className = '',
  ...props
}: DarkButtonProps) => {
  // Base classes
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 overflow-hidden';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    accent: 'bg-accent-600 hover:bg-accent-700 text-white',
    ghost: 'bg-gray-800/50 hover:bg-gray-800/80 text-white border border-gray-700',
  };
  
  // Glow classes
  const glowClasses = glow ? {
    primary: 'shadow-md shadow-primary-500/20 hover:shadow-primary-500/30',
    secondary: 'shadow-md shadow-secondary-500/20 hover:shadow-secondary-500/30',
    accent: 'shadow-md shadow-accent-500/20 hover:shadow-accent-500/30',
    ghost: '',
  } : {
    primary: '',
    secondary: '',
    accent: '',
    ghost: '',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled classes
  const disabledClasses = props.disabled ? 'opacity-60 cursor-not-allowed' : '';
  
  // Combine all classes
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${glowClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`;
  
  return (
    <motion.button
      className={buttonClasses}
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.98 }}
      {...props}
    >
      {/* Animated gradient overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      
      {/* Button content */}
      <span className="relative flex items-center justify-center">
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </span>
    </motion.button>
  );
};

export default DarkButton;
