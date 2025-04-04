import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200';
    
    // Error classes
    const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
    
    // Icon classes
    const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Disabled classes
    const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    
    // Combine all classes
    const inputClasses = `${baseClasses} ${errorClasses} ${iconClasses} ${widthClasses} ${disabledClasses} ${className}`;
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          
          <input ref={ref} className={inputClasses} {...props} />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
