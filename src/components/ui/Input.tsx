// Input Component with Glassmorphism styling
import React from 'react';
import { cn } from '@/core/shared/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            {...props}
            ref={ref}
            style={{
              paddingLeft: icon ? '1rem' : '0.75rem',
              paddingRight: '0.75rem',
              ...props.style,
            }}
            className={cn(
              'w-full py-3 rounded-xl border',
              'border-gray-200 dark:border-gray-600',
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
              'text-gray-900 dark:text-gray-100',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent',
              'transition-all duration-200',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              error ? 'border-red-500 focus:ring-red-500' : '',
              className
            )}
            />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

