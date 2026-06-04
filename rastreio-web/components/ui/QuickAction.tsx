import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickActionProps {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  accent?: boolean;
}

export function QuickAction({ href, icon: Icon, label, description, accent }: QuickActionProps) {
  return (
    <Link href={href} className={`
      flex flex-col items-center justify-center gap-2
      p-5 rounded-xl border transition-all duration-200
      hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
      ${accent
        ? 'bg-cta-DEFAULT/10 border-cta-DEFAULT/30 hover:bg-cta-DEFAULT/20'
        : 'bg-bg-surface border-bg-border hover:bg-bg-elevated hover:border-bg-border'
      }
    `}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${accent ? 'bg-cta-DEFAULT/20' : 'bg-bg-elevated'}`}>
        <Icon size={20} className={accent ? 'text-cta-light' : 'text-text-secondary'} />
      </div>
      <p className={`text-sm font-medium ${accent ? 'text-cta-light' : 'text-text-primary'}`}>
        {label}
      </p>
      {description && (
        <p className="text-xs text-text-muted text-center">{description}</p>
      )}
    </Link>
  );
}
