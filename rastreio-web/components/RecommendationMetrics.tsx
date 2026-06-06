'use client';

import type { RecommendationMetrics } from '@/types';

interface RecommendationMetricsProps {
  metrics: RecommendationMetrics;
}

function SummaryCard({
  label,
  value,
  description,
  highlight,
}: {
  label: string;
  value: number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? 'border-primary-400 bg-primary-50/40' : 'border-gray-200 bg-white'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export function RecommendationMetrics({ metrics }: RecommendationMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <SummaryCard
        label="Total de Recomendações"
        value={metrics.total}
        description="Recomendações geradas para seu rebanho"
      />
      <SummaryCard
        label="Pendentes"
        value={metrics.pendentes}
        description="Ações ainda não reconhecidas"
        highlight={metrics.pendentes > 0}
      />
      <SummaryCard
        label="Reconhecidas"
        value={metrics.reconhecidas}
        description="Insights já confirmados"
      />
      <SummaryCard
        label="Resolvidas"
        value={metrics.resolvidas}
        description="Tarefas completadas"
      />
      <SummaryCard
        label="Alta Prioridade"
        value={metrics.altaPrioridade}
        description="Ações críticas a priorizar"
        highlight={metrics.altaPrioridade > 0}
      />
    </div>
  );
}
