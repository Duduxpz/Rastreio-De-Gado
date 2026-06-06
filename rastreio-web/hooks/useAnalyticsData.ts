import { useEffect, useState } from 'react';
import { AnalyticsSnapshot, AnalyticsStats } from '@/types';

interface UseAnalyticsOptions {
  limit?: number;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { limit = 30 } = options;
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/snapshots?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch snapshots');
      const { data, success } = await response.json();

      if (success) {
        setSnapshots(data);
        // Calculate stats from latest snapshot
        if (data.length > 0) {
          const latest = data[0];
          setStats({
            totalAnimais: latest.total_animais,
            animalsSemPesagemRecente: latest.animais_sem_pesagem_recente,
            vacinacoesPendentes: latest.vacinacoes_pendentes,
            rebanhoPorCategoria: latest.payload?.categorias || {},
            pesoBaixoAnimais: latest.payload?.pesoBaixo || 0,
            taxaSaude: Math.round((latest.rebanho_score / 100) * 100),
            evolucaoPesoMes: latest.payload?.evolucao || [],
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateSnapshot = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/snapshot', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to generate snapshot');
      const { data, success } = await response.json();

      if (success) {
        await fetchSnapshots(); // Refresh snapshots
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, [limit]);

  return {
    snapshots,
    stats,
    loading,
    error,
    fetchSnapshots,
    generateSnapshot,
  };
}

export function useAlerts(filters?: {
  nivel?: 'INFO' | 'WARNING' | 'CRITICAL';
  lida?: boolean;
  limit?: number;
}) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters?.nivel) params.append('nivel', filters.nivel);
      if (filters?.lida !== undefined) params.append('lida', String(filters.lida));
      if (filters?.limit) params.append('limite', String(filters.limit));

      const response = await fetch(`/api/alerts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch alerts');
      const { data, total: count, success } = await response.json();

      if (success) {
        setAlerts(data);
        setTotal(count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lida: true }),
      });

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, lida: true } : a))
        );
      }
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filters?.nivel, filters?.lida, filters?.limit]);

  return { alerts, total, loading, error, fetchAlerts, markAsRead };
}

export function useRecommendations(filters?: {
  prioridade?: number;
  acknowledged?: boolean;
  limit?: number;
}) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters?.prioridade) params.append('prioridade', String(filters.prioridade));
      if (filters?.acknowledged !== undefined) params.append('acknowledged', String(filters.acknowledged));
      if (filters?.limit) params.append('limite', String(filters.limit));

      const response = await fetch(`/api/recommendations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const { data, total: count, success } = await response.json();

      if (success) {
        setRecommendations(data);
        setTotal(count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const acknowledge = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/recommendations/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acknowledged: true }),
      });

      if (response.ok) {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, acknowledged: true } : r))
        );
      }
    } catch (err) {
      console.error('Failed to acknowledge recommendation:', err);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filters?.prioridade, filters?.acknowledged, filters?.limit]);

  return {
    recommendations,
    total,
    loading,
    error,
    fetchRecommendations,
    acknowledge,
  };
}
