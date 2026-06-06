'use client';

import { useState, useEffect } from 'react';
import { useRecommendations } from '@/hooks/useAnalyticsData';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';

const PRIORIDADE_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Crítica', color: 'text-red-700 bg-red-50 border-red-200' },
  2: { label: 'Alta', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  3: { label: 'Média', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  4: { label: 'Baixa', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  5: { label: 'Informativa', color: 'text-gray-700 bg-gray-50 border-gray-200' },
};

export default function RecomendacoesPage() {
  const [prioridade, setPrioridade] = useState<number | undefined>(undefined);
  const [acknowledged, setAcknowledged] = useState<boolean | undefined>(undefined);

  const { recommendations, loading, error, acknowledge } = useRecommendations({
    prioridade,
    acknowledged,
    limit: 50,
  });

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Recomendações" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Recomendações Inteligentes" />

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={prioridade?.toString() || ''}
              onChange={(e) => setPrioridade(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              <option value="1">Crítica</option>
              <option value="2">Alta</option>
              <option value="3">Média</option>
              <option value="4">Baixa</option>
              <option value="5">Informativa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={acknowledged === undefined ? '' : acknowledged ? 'true' : 'false'}
              onChange={(e) =>
                setAcknowledged(e.target.value === '' ? undefined : e.target.value === 'true')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas</option>
              <option value="false">Não Reconhecidas</option>
              <option value="true">Reconhecidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState text="Carregando recomendações..." />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="Sem recomendações"
          description="Parabéns! Seu rebanho está funcionando bem. Não há recomendações no momento."
        />
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const prioridadeInfo = PRIORIDADE_MAP[rec.prioridade] || PRIORIDADE_MAP[3];
            return (
              <Card key={rec.id} variant="outlined">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Badge de Prioridade */}
                  <div
                    className={`px-3 py-2 rounded-md text-sm font-semibold whitespace-nowrap ${prioridadeInfo.color}`}
                  >
                    {prioridadeInfo.label}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {rec.motivo}
                    </h3>
                    <p className="text-gray-600 mt-2">{rec.impacto}</p>

                    {/* Detalhes do payload se existir */}
                    {rec.payload && Object.keys(rec.payload).length > 0 && (
                      <div className="mt-3 bg-gray-50 rounded p-3 text-sm text-gray-700">
                        <details>
                          <summary className="font-medium cursor-pointer">
                            Detalhes Técnicos
                          </summary>
                          <pre className="mt-2 text-xs overflow-x-auto">
                            {JSON.stringify(rec.payload, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}

                    {/* Data */}
                    <div className="mt-3 text-xs text-gray-500">
                      {new Date(rec.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 md:flex-row">
                    {!rec.acknowledged && (
                      <Button
                        onClick={() => acknowledge(rec.id)}
                        variant="secondary"
                        size="sm"
                      >
                        Reconhecer
                      </Button>
                    )}
                    {rec.acknowledged && (
                      <span className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md">
                        ✓ Reconhecida
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
