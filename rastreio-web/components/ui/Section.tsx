interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({
  title,
  subtitle,
  children,
  action,
}: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {subtitle && (
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}
