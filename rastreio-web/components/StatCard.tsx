import React from 'react'; // CORRIGIDO: Adicionar import do React para usar React.memo
import { Card } from './ui/Card';

// CORRIGIDO: Mover constantes para fora do componente
const TREND_COLORS = {
  up: 'text-green-600',
  down: 'text-red-600',
  stable: 'text-gray-600',
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

// CORRIGIDO: Envolver componente em React.memo
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
        <div className={`mt-4 text-sm ${TREND_COLORS[trend]} font-medium`}>
          {TREND_ICONS[trend]} {trend === 'up' ? 'Aumentando' : trend === 'down' ? 'Diminuindo' : 'Estável'}
        </div>
      )}
    </Card>
  );
});
