'use client';

import { useState } from 'react';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Centro Inteligente de Insights Pecuários" />
        <Button
          onClick={handleGenerateNew}
          disabled={generatingNew || loading}
          className="flex-shrink-0"
        >
          {generatingNew ? 'Gerando...' : '🤖 Gerar Insights'}
        </Button>
      </div>

      {/* Métricas */}
      {metrics && <RecommendationMetrics metrics={metrics} />}

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={prioridade || ''}
              onChange={(e) => setPrioridade((e.target.value as Prioridade) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
              <option value="INFORMATIVA">Informativa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status || ''}
              onChange={(e) => setStatus((e.target.value as RecommendationStatus) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="Nenhuma recomendação no momento"
          description="Parabéns! Seu rebanho está funcionando bem. Clique em 'Gerar Insights' para buscar novas recomendações."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Mostrando <strong>{recommendations.length}</strong> recomendação
            {recommendations.length !== 1 ? 's' : ''}
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
