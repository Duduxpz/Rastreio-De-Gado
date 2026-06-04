import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  const variants = {
    default: 'bg-primary-600 rounded-lg shadow',
    elevated:
      'bg-primary-600 rounded-lg shadow-lg hover:shadow-xl transition-shadow',
    bordered: 'bg-primary-600 rounded-lg border border-primary-700',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>{children}</div>
  );
}
