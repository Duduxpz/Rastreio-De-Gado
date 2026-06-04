type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

const styles: Record<Variant, string> = {
  success: 'bg-success-subtle text-success-DEFAULT border-success-DEFAULT/20',
  warning: 'bg-warning-subtle text-warning-DEFAULT border-warning-DEFAULT/20',
  danger: 'bg-danger-subtle text-danger-DEFAULT border-danger-DEFAULT/20',
  info: 'bg-info-subtle text-info-DEFAULT border-info-DEFAULT/20',
  neutral: 'bg-bg-elevated text-text-secondary border-bg-border',
  brand: 'bg-brand-subtle text-brand-light border-brand-DEFAULT/20',
};

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: Variant }) {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full
      text-xs font-medium border ${styles[variant]}
    `}>
      {label}
    </span>
  );
}
