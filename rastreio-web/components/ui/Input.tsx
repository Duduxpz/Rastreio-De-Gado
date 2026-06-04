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
        <label className="block text-sm font-medium text-primary-100 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-300">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 ${icon ? 'pl-10' : ''} rounded-lg border bg-primary-700 text-white placeholder-primary-300
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-primary-600 focus:border-primary-400 focus:ring-primary-400'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-colors
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-primary-300">{hint}</p>}
    </div>
  );
}
