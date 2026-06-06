'use client';

import React, { useState } from 'react';
import type { Recommendation } from '@/types';
import { Button } from '@/components/ui/Button';

const PRIORIDADE_CONFIG: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  ALTA: {
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
  },
  MEDIA: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  BAIXA: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  INFORMATIVA: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
  },
};

const STATUS_CONFIG: Record<string, string> = {
  PENDENTE: 'Pendente',
  RECONHECIDA: 'Reconhecida',
  RESOLVIDA: 'Resolvida',
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  onStatusChange: (id: string, status: 'RECONHECIDA' | 'RESOLVIDA') => Promise<void>;
  loading?: boolean;
}

export function RecommendationCard({
  recommendation,
  onStatusChange,
  loading = false,
}: RecommendationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const config = PRIORIDADE_CONFIG[recommendation.prioridade] || PRIORIDADE_CONFIG.MEDIA;

  const handleStatusChange = async (newStatus: 'RECONHECIDA' | 'RESOLVIDA') => {
    setIsUpdating(true);
    try {
      await onStatusChange(recommendation.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`rounded-lg border ${config.border} ${config.bg} p-6 space-y-4 transition-all hover:shadow-md`}
    >
      {/* Header com prioridade e status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Prioridade Badge */}
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.badge} mb-3`}>
            {recommendation.prioridade}
          </div>

          {/* Título */}
          <h3 className={`text-lg font-bold ${config.text} break-words`}>{recommendation.titulo}</h3>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              recommendation.status === 'RESOLVIDA'
                ? 'bg-green-100 text-green-800'
                : recommendation.status === 'RECONHECIDA'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {STATUS_CONFIG[recommendation.status]}
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <p className="text-gray-700 leading-relaxed">{recommendation.descricao}</p>
      </div>

      {/* Impacto */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Impacto:</h4>
        <p className="text-sm text-gray-600">{recommendation.impacto}</p>
      </div>

      {/* Sugestão da IA */}
      <div className="bg-white rounded-lg p-4 border border-primary-200 border-l-4 border-l-primary-600">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">💡 Sugestão da IA:</h4>
        <p className="text-sm text-primary-800">{recommendation.sugestao}</p>
      </div>

      {/* Accordion - Análise da IA */}
      <details className="group cursor-pointer">
        <summary className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition">
          <span className="text-sm font-semibold text-gray-900">Análise da IA</span>
          <span className="text-lg text-gray-500 group-open:rotate-180 transition-transform">›</span>
        </summary>
        <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
          {recommendation.analiseIA}
        </div>
      </details>

      {/* Data de geração */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>Gerado em {formatDate(recommendation.created_at)}</span>
        {recommendation.updated_at && recommendation.updated_at !== recommendation.created_at && (
          <span>Atualizado em {formatDate(recommendation.updated_at)}</span>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-4 flex-wrap">
        {recommendation.status === 'PENDENTE' && (
          <>
            <Button
              onClick={() => handleStatusChange('RECONHECIDA')}
              disabled={isUpdating || loading}
              className="flex-1 text-sm"
            >
              {isUpdating ? 'Atualizando...' : 'Reconhecer'}
            </Button>
            <Button
              onClick={() => handleStatusChange('RESOLVIDA')}
              variant="secondary"
              disabled={isUpdating || loading}
              className="flex-1 text-sm"
            >
              {isUpdating ? 'Atualizando...' : 'Concluir'}
            </Button>
          </>
        )}
        {recommendation.status === 'RECONHECIDA' && (
          <Button
            onClick={() => handleStatusChange('RESOLVIDA')}
            className="flex-1 text-sm"
            disabled={isUpdating || loading}
          >
            {isUpdating ? 'Atualizando...' : 'Marcar Resolvida'}
          </Button>
        )}
        {recommendation.status === 'RESOLVIDA' && (
          <div className="flex-1 text-center py-2 text-green-700 font-semibold text-sm">
            ✓ Resolvida
          </div>
        )}
      </div>
    </div>
  );
}
