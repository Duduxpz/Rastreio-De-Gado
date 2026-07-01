import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly hint?: string;
  readonly icon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly onRightIconClick?: () => void;
}

export function Input(props: Readonly<InputProps>) {
  const {
    label,
    error,
    hint,
    icon,
    rightIcon,
    onRightIconClick,
    className = '',
    ...inputProps
  } = props;
  const hasLeftIcon = Boolean(icon);
  const hasRightIcon = Boolean(rightIcon);

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
            w-full px-4 py-3 ${hasLeftIcon ? 'pl-11' : ''} ${hasRightIcon ? 'pr-11' : ''} rounded-2xl border bg-bg-elevated text-text-primary placeholder-text-muted
            ${
              error
                ? 'border-danger-DEFAULT focus:border-danger-DEFAULT focus:ring-danger-DEFAULT'
                : 'border-bg-border focus:border-brand-DEFAULT focus:ring-brand-DEFAULT'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-colors
            ${className}
          `}
          {...inputProps}
        />
        {hasRightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Toggle password visibility"
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-DEFAULT">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-text-muted">{hint}</p>}
    </div>
  );
}
