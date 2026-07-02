'use client';

import { useState } from 'react';
import { Activity, Leaf, ShieldAlert } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { RecommendationCard } from '@/components/RecommendationCard';
import { RecommendationMetrics } from '@/components/RecommendationMetrics';
import type { Prioridade, RecommendationStatus } from '@/types';

export default function RecomendacoesPage() {
  const [prioridade, setPrioridade] = useState<Prioridade | undefined>(undefined);
  const [status, setStatus] = useState<RecommendationStatus | undefined>(undefined);
  const [generatingNew, setGeneratingNew] = useState(false);

  const {
    recommendations,
    metrics,
    loading,
    error,
    updateStatus,
    generateNewRecommendations,
  } = useRecommendations({
    prioridade,
    status,
    limit: 100,
  });

  const handleGenerateNew = async () => {
    setGeneratingNew(true);
    try {
      await generateNewRecommendations();
    } finally {
      setGeneratingNew(false);
    }
  };

  const hasRecommendations = recommendations.length > 0;
  const pluralizedLabel = recommendations.length === 1 ? 'recomendação' : 'recomendações';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Recomendações"
          description="Orientações personalizadas para saúde, manejo e produtividade"
        />
        <Button
          onClick={handleGenerateNew}
          disabled={generatingNew || loading}
          className="flex-shrink-0"
        >
          {generatingNew ? 'Gerando...' : 'Gerar Insights'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-brand-DEFAULT/30 bg-brand-subtle/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-brand-light"><ShieldAlert size={16} /> Saúde</div>
          <p className="text-sm text-text-secondary">Vacinações, doenças e alertas sanitários.</p>
        </div>
        <div className="rounded-xl border border-info-DEFAULT/30 bg-info-subtle/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-info-DEFAULT"><Activity size={16} /> Manejo</div>
          <p className="text-sm text-text-secondary">Calendários, peso e desempenho do rebanho.</p>
        </div>
        <div className="rounded-xl border border-success-DEFAULT/30 bg-success-subtle/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-success-DEFAULT"><Leaf size={16} /> Nutrição</div>
          <p className="text-sm text-text-secondary">Planejamento de pastagem e suplementação.</p>
        </div>
      </div>

      {metrics && <RecommendationMetrics metrics={metrics} />}

      <div className="bg-bg-surface rounded-lg border border-bg-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prioridade-filter" className="block text-sm font-medium text-text-secondary mb-2">
              Prioridade
            </label>
            <select
              id="prioridade-filter"
              value={prioridade || ''}
              onChange={(e) => setPrioridade((e.target.value as Prioridade) || undefined)}
              className="w-full px-3 py-2 border border-bg-border rounded-md bg-bg-elevated text-sm text-text-primary"
            >
              <option value="">Todas</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
              <option value="INFORMATIVA">Informativa</option>
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={status || ''}
              onChange={(e) => setStatus((e.target.value as RecommendationStatus) || undefined)}
              className="w-full px-3 py-2 border border-bg-border rounded-md bg-bg-elevated text-sm text-text-primary"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="RECONHECIDA">Reconhecida</option>
              <option value="RESOLVIDA">Resolvida</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setPrioridade(undefined);
                setStatus(undefined);
              }}
              variant="secondary"
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Erro ao carregar recomendações</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingState message="Carregando insights inteligentes..." />
      ) : !hasRecommendations ? (
        <EmptyState
          title="Nenhuma recomendação no momento"
          description="Parabéns! Seu rebanho está funcionando bem. Clique em 'Gerar Insights' para buscar novas recomendações."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{recommendations.length}</strong> {pluralizedLabel}
          </p>
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onStatusChange={updateStatus}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
