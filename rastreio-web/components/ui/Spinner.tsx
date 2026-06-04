interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'gray';
}

export function Spinner({ size = 'md', color = 'primary' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary-300 border-t-transparent',
    gray: 'border-primary-400 border-t-primary-100',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full animate-spin`}
    />
  );
}
