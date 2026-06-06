'use client';

import React from 'react';
import { StatCard } from './StatCard';
import type { RecommendationMetrics } from '@/types';

interface RecommendationMetricsProps {
  metrics: RecommendationMetrics;
}

export function RecommendationMetrics({ metrics }: RecommendationMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total de Recomendações"
        value={metrics.total}
        delta={metrics.total > 0 ? '+' + metrics.total : ''}
        deltaPositive={metrics.total >= 3}
      />
      <StatCard
        label="Pendentes"
        value={metrics.pendentes}
        delta={metrics.pendentes > 0 ? 'Requer ação' : 'Em dia'}
        deltaPositive={metrics.pendentes === 0}
      />
      <StatCard
        label="Reconhecidas"
        value={metrics.reconhecidas}
        delta={metrics.reconhecidas > 0 ? 'Em progresso' : ''}
        deltaPositive={true}
      />
      <StatCard
        label="Resolvidas"
        value={metrics.resolvidas}
        delta={metrics.resolvidas > 0 ? '+' + metrics.resolvidas : ''}
        deltaPositive={true}
      />
      <StatCard
        label="Alta Prioridade"
        value={metrics.altaPrioridade}
        delta={metrics.altaPrioridade === 0 ? 'Nenhuma' : 'Atenção!'}
        deltaPositive={metrics.altaPrioridade === 0}
      />
    </div>
  );
}
