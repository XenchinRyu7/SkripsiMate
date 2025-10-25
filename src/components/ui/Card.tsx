// Card Component with Glassmorphism
import React from 'react';
import { cn } from '@/core/shared/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glass-card';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    glass: 'glass',
    'glass-card': 'glass-card',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        variants[variant],
        hover && 'glass-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

