import React from 'react';
import { Card } from './ui/Card';

const TREND_COLORS = {
  up: 'text-accent-400',
  down: 'text-red-400',
  stable: 'text-primary-400',
} as const;

const TREND_ICONS = {
  up: '↑',
  down: '↓',
  stable: '→',
} as const;

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  delta?: { value: number; isPositive: boolean };
  trend?: 'up' | 'down' | 'stable';
}

export const StatCard = React.memo(function StatCard({
  label,
  value,
  icon,
  delta,
  trend = 'stable',
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-300 mb-2">{label}</p>
          <p className="text-3xl font-bold text-accent-400">{value}</p>
          {delta && (
            <p className={`text-xs mt-2 ${delta.isPositive ? 'text-accent-400' : 'text-red-400'}`}>
              {delta.isPositive ? '+' : '-'}{Math.abs(delta.value)}% vs mês passado
            </p>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-4 text-sm ${TREND_COLORS[trend]} font-medium`}>
          {TREND_ICONS[trend]} {trend === 'up' ? 'Aumentando' : trend === 'down' ? 'Diminuindo' : 'Estável'}
        </div>
      )}
    </Card>
  );
});
