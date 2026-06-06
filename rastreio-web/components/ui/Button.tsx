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
    'inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-cta-DEFAULT/90 text-white hover:bg-cta-DEFAULT active:bg-cta-dim shadow-[0_10px_24px_rgba(251,146,60,0.18)]',
    secondary:
      'bg-bg-elevated/80 text-white hover:bg-bg-elevated active:bg-bg-border border border-bg-border',
    danger: 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600',
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
