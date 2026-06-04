import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-cta-DEFAULT text-text-inverse hover:bg-cta-light active:bg-cta-dim font-semibold shadow-[0_2px_12px_rgba(249,115,22,0.3)]',
    secondary:
      'bg-bg-elevated text-text-primary hover:bg-bg-border active:bg-bg-border border border-bg-border',
    danger: 'bg-danger-DEFAULT text-text-inverse hover:bg-danger-DEFAULT/90 active:bg-danger-DEFAULT/80',
    ghost: 'text-text-secondary hover:bg-bg-elevated active:bg-bg-border',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
