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
    default: 'bg-bg-surface rounded-xl border border-bg-border shadow',
    elevated:
      'bg-bg-surface rounded-xl border border-bg-border shadow-lg hover:shadow-xl transition-shadow',
    bordered: 'bg-bg-surface rounded-xl border border-bg-border',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>{children}</div>
  );
}
