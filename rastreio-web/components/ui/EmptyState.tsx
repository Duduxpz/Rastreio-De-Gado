import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: string | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps) {
  const isStringIcon = typeof icon === 'string';
  const Icon = !isStringIcon ? (icon as LucideIcon) : null;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {isStringIcon ? (
        <div className="text-5xl mb-4">{icon}</div>
      ) : (
        Icon && <Icon size={48} className="text-text-muted mb-4" />
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-cta-DEFAULT text-text-inverse rounded-lg hover:bg-cta-light transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
