import type { LucideIcon } from 'lucide-react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;      // ex: 'text-brand-DEFAULT'
  iconBg?: string;         // ex: 'bg-brand-subtle'
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

const trendConfig = {
  up:      { icon: TrendingUp,   color: 'text-success-DEFAULT', bg: 'bg-success-subtle' },
  down:    { icon: TrendingDown, color: 'text-danger-DEFAULT',  bg: 'bg-danger-subtle'  },
  neutral: { icon: Minus,        color: 'text-text-muted',      bg: 'bg-bg-elevated'    },
};

export function StatCard({
  label, value, icon: Icon,
  iconColor = 'text-brand-DEFAULT',
  iconBg    = 'bg-brand-subtle',
  trend, trendLabel,
}: StatCardProps) {
  const T = trend ? trendConfig[trend] : null;
  return (
    <div className="
      bg-bg-surface border border-bg-border rounded-xl p-5
      ring-1 ring-white/[0.04]
      hover:border-bg-elevated hover:bg-bg-elevated/50
      transition-all duration-200 group
    ">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg ${iconBg}
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>

      <p className="text-3xl font-bold tabular-nums text-text-primary mb-3">
        {value}
      </p>

      {T && trendLabel && (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1
                        rounded-full text-xs font-medium ${T.color} ${T.bg}`}>
          <T.icon size={11} />
          {trendLabel}
        </div>
      )}
    </div>
  );
}
