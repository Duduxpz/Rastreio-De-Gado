'use client';

import { useEffect, useState } from 'react';
import { getSessionToken } from '@/lib/supabase';
import type { Recommendation, RecommendationMetrics, Prioridade, RecommendationStatus } from '@/types';

interface UseRecommendationsFilters {
  prioridade?: Prioridade;
  status?: RecommendationStatus;
  limit?: number;
  offset?: number;
}

export function useRecommendations(filters?: UseRecommendationsFilters) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getSessionToken();
      if (!token) throw new Error('No session token');
      const params = new URLSearchParams();

      if (filters?.prioridade) params.append('prioridade', filters.prioridade);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limite', String(filters.limit));
      if (filters?.offset) params.append('offset', String(filters.offset));

      const response = await fetch(`/api/recommendations?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const { success, data, total: count } = await response.json();
      if (success) {
        setRecommendations(data);
        setTotal(count || 0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const token = await getSessionToken();
      if (!token) throw new Error('No session token');
      const response = await fetch('/api/recommendations/metrics', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch metrics');

      const { success, data } = await response.json();
      if (success) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
    }
  };

  const updateStatus = async (
    id: string,
    status: 'RECONHECIDA' | 'RESOLVIDA'
  ): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recommendations/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update recommendation');

      const { success } = await response.json();
      if (success) {
        // Atualizar localmente
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        // Atualizar métricas
        await fetchMetrics();
        return;
      }
    } catch (err) {
      console.error('Erro ao atualizar recomendação:', err);
    }
  };

  const generateNewRecommendations = async (): Promise<Recommendation | null> => {
    try {
      const token = await getSessionToken();
      if (!token) throw new Error('No session token');
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to generate recommendations');

      const { success, data } = await response.json();
      if (success) {
        // Buscar novamente para atualizar a lista
        await fetchRecommendations();
        await fetchMetrics();
        return data;
      }
    } catch (err) {
      console.error('Erro ao gerar recomendações:', err);
    }
    return null;
  };

  // Buscar recomendações quando filtros mudam
  useEffect(() => {
    fetchRecommendations();
  }, [filters?.prioridade, filters?.status, filters?.limit, filters?.offset]);

  // Buscar métricas na montagem
  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    recommendations,
    metrics,
    total,
    loading,
    error,
    fetchRecommendations,
    fetchMetrics,
    updateStatus,
    generateNewRecommendations,
  };
}
