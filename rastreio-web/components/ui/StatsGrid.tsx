interface StatsGridProps {
  stats: Array<{
    icon?: string;
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    delta?: string;
  }>;
}

import { StatCard } from '../StatCard';

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          trend={stat.trend}
          delta={stat.delta ? { value: parseInt(stat.delta), isPositive: stat.trend === 'up' } : undefined}
        />
      ))}
    </div>
  );
}
