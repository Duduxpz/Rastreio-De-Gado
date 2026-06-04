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
    default: 'bg-white rounded-lg shadow',
    elevated:
      'bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow',
    bordered: 'bg-white rounded-lg border border-gray-200',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>{children}</div>
  );
}
