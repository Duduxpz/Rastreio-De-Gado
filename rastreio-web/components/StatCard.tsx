import { Card } from './ui/Card';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  delta?: { value: number; isPositive: boolean };
  trend?: 'up' | 'down' | 'stable';
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  trend = 'stable',
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {delta && (
            <p className={`text-xs mt-2 ${delta.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {delta.isPositive ? '+' : '-'}{Math.abs(delta.value)}% vs mês passado
            </p>
          )}
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-4 text-sm ${trendColors[trend]} font-medium`}>
          {trendIcons[trend]} {trend === 'up' ? 'Aumentando' : trend === 'down' ? 'Diminuindo' : 'Estável'}
        </div>
      )}
    </Card>
  );
}
