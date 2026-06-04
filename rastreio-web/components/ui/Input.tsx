import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 ${icon ? 'pl-10' : ''} rounded-lg border bg-bg-elevated text-text-primary placeholder-text-muted
            ${
              error
                ? 'border-danger-DEFAULT focus:border-danger-DEFAULT focus:ring-danger-DEFAULT'
                : 'border-bg-border focus:border-brand-DEFAULT focus:ring-brand-DEFAULT'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-colors
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-danger-DEFAULT">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-text-muted">{hint}</p>}
    </div>
  );
}
