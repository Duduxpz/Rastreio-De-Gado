interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const variants = {
    success: 'bg-green-400 text-green-900',
    warning: 'bg-yellow-400 text-yellow-900',
    danger: 'bg-red-400 text-red-900',
    info: 'bg-blue-400 text-blue-900',
    neutral: 'bg-primary-300 text-primary-900',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
