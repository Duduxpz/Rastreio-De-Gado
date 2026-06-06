import { useEffect, useState } from 'react';
import { AnalyticsSnapshot, AnalyticsStats } from '@/types';

interface UseAnalyticsOptions {
  limit?: number;
}

const parseLocalStorageList = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Erro ao ler ${key} do localStorage`, error);
    return [];
  }
};

const contarPorCampo = (array: any[], campo: string) => {
  return array.reduce((acc, item) => {
    const valor = item?.[campo] || 'Não informado';
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const calcularPesagensPorMes = (pesagens: any[]) => {
  return pesagens.reduce((acc, p) => {
    if (!p?.data) return acc;
    const mes = String(p.data).slice(0, 7);
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const calcularGanhoMedio = (pesagens: any[]) => {
  const pesos = pesagens
    .map((p) => Number(p?.peso))
    .filter((peso) => !Number.isNaN(peso));

  if (pesos.length === 0) return 0;
  return pesos.reduce((sum, peso) => sum + peso, 0) / pesos.length;
};

const gerarAnalyticsSnapshotFromStorage = (): AnalyticsSnapshot | null => {
  const animais = parseLocalStorageList<any>('animais');
  const vacinacoes = parseLocalStorageList<any>('vacinacoes');
  const pesagens = parseLocalStorageList<any>('pesagens');

  if (!animais.length && !vacinacoes.length && !pesagens.length) {
    return null;
  }

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - 30);

  const lastPesoByAnimal: Record<string, any> = {};
  pesagens.forEach((pesagem) => {
    const animalId = pesagem?.animal_id;
    if (!animalId) return;
    const data = pesagem?.data ? new Date(pesagem.data) : null;
    if (!data || Number.isNaN(data.getTime())) return;

    const current = lastPesoByAnimal[animalId];
    if (!current || data > new Date(current.data)) {
      lastPesoByAnimal[animalId] = pesagem;
    }
  });

  const animaisSemPesagemRecente = animais.filter((animal) => {
    const last = lastPesoByAnimal[animal.id];
    if (!last) return true;
    const data = new Date(last.data);
    return Number.isNaN(data.getTime()) || data < threshold;
  }).length;

  const vacinacoesPendentes = vacinacoes.filter((vacina) => {
    if (vacina?.status === 'aplicada') return false;
    if (vacina?.status === 'pendente') return true;
    if (vacina?.proxima_dose) {
      const proxima = new Date(vacina.proxima_dose);
      return !Number.isNaN(proxima.getTime()) && proxima <= new Date();
    }
    return false;
  }).length;

  const avgPeso = calcularGanhoMedio(pesagens);

  const totalAnimais = animais.length;
  let score = totalAnimais === 0 ? 0 : 100;
  if (totalAnimais > 0) {
    score -= Math.min(40, animaisSemPesagemRecente * 3);
    score -= Math.min(30, vacinacoesPendentes * 2);
    const missingCadastro = animais.filter((animal) => !animal.raca || !animal.lote).length;
    score -= Math.min(15, Math.round((missingCadastro / totalAnimais) * 15));
  }
  score = Math.max(0, Math.min(100, score));

  return {
    id: `local-snapshot-${Date.now()}`,
    fazenda_id: 'local',
    total_animais: totalAnimais,
    animais_sem_pesagem_recente: animaisSemPesagemRecente,
    vacinacoes_pendentes: vacinacoesPendentes,
    rebanho_score: score,
    avg_peso: avgPeso,
    payload: {
      categorias: contarPorCampo(animais, 'categoria'),
      raca: contarPorCampo(animais, 'raca'),
      pasto: contarPorCampo(animais, 'pasto'),
      lote: contarPorCampo(animais, 'lote'),
      pesagensPorMes: calcularPesagensPorMes(pesagens),
      ganhoMedioPeso: avgPeso,
    },
    created_at: new Date().toISOString(),
  };
};

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { limit = 30 } = options;
  const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSnapshots = async () => {
    setLoading(true);
    try {
      const snapshot = gerarAnalyticsSnapshotFromStorage();
      if (!snapshot) {
        setSnapshots([]);
        setStats(null);
        return;
      }

      setSnapshots([snapshot]);
      setStats({
        totalAnimais: snapshot.total_animais,
        animalsSemPesagemRecente: snapshot.animais_sem_pesagem_recente,
        vacinacoesPendentes: snapshot.vacinacoes_pendentes,
        rebanhoPorCategoria: snapshot.payload?.categorias || {},
        pesoBaixoAnimais: snapshot.payload?.pesoBaixo || 0,
        taxaSaude: Math.round(snapshot.rebanho_score),
        evolucaoPesoMes: Object.entries(snapshot.payload?.pesagensPorMes || {}).map(
          ([data, pesoMedio]) => ({ data, pesoMedio: Number(pesoMedio) || 0 })
        ),
      });
    } catch (err) {
      console.warn('Dados não disponíveis, usando localStorage como fallback', err);
      setSnapshots([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const generateSnapshot = async () => {
    setLoading(true);
    try {
      await fetchSnapshots();
    } catch (err) {
      console.warn('Erro ao gerar snapshot local', err);
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

const gerarRecomendacoesFromStorage = () => {
  const animais = parseLocalStorageList<any>('animais');
  const vacinacoes = parseLocalStorageList<any>('vacinacoes');
  const pesagens = parseLocalStorageList<any>('pesagens');
  const hoje = new Date();
  const recomendacoes: Array<Record<string, any>> = [];

  const vencidas = vacinacoes.filter((v) => {
    if (v?.status === 'aplicada') return false;
    if (v?.status === 'pendente') return true;
    if (!v?.dataVencimento) return false;
    const dataVencimento = new Date(v.dataVencimento);
    return !Number.isNaN(dataVencimento.getTime()) && dataVencimento < hoje;
  });

  if (vencidas.length > 0) {
    recomendacoes.push({
      id: 'vacinas-vencidas',
      prioridade: 1,
      motivo: `${vencidas.length} vacinação(ões) vencida(s)`,
      impacto: 'Existem vacinações com prazo expirado que precisam ser aplicadas ou atualizadas imediatamente.',
      payload: { totalVencidas: vencidas.length },
      acknowledged: false,
      created_at: new Date().toISOString(),
    });
  }

  const semVacina = animais.filter((animal) =>
    !vacinacoes.some((vacina) => vacina?.animal_id === animal.id)
  );
  if (semVacina.length > 0) {
    recomendacoes.push({
      id: 'sem-vacina',
      prioridade: 2,
      motivo: `${semVacina.length} animal(is) sem vacinação registrada`,
      impacto: 'Registre as vacinações para manter o controle sanitário do rebanho.',
      payload: { totalSemVacina: semVacina.length },
      acknowledged: false,
      created_at: new Date().toISOString(),
    });
  }

  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  const semPesagemRecente = animais.filter((animal) => {
    const pesagensAnimal = pesagens.filter((p) => p?.animal_id === animal.id);
    return !pesagensAnimal.some((p) => {
      const data = p?.data ? new Date(p.data) : null;
      return data && !Number.isNaN(data.getTime()) && data >= trintaDiasAtras;
    });
  });

  if (semPesagemRecente.length > 0 && animais.length > 0) {
    recomendacoes.push({
      id: 'sem-pesagem',
      prioridade: 2,
      motivo: `${semPesagemRecente.length} animal(is) sem pesagem nos últimos 30 dias`,
      impacto: 'Realize pesagens regulares para acompanhar o desenvolvimento do rebanho.',
      payload: { totalSemPesagemRecente: semPesagemRecente.length },
      acknowledged: false,
      created_at: new Date().toISOString(),
    });
  }

  if (animais.length === 0) {
    recomendacoes.push({
      id: 'sem-animais',
      prioridade: 5,
      motivo: 'Cadastre seus animais para começar',
      impacto: 'Adicione os animais do rebanho para aproveitar todos os recursos do sistema.',
      payload: {},
      acknowledged: false,
      created_at: new Date().toISOString(),
    });
  }

  if (pesagens.length === 0 && animais.length > 0) {
    recomendacoes.push({
      id: 'sem-historico-peso',
      prioridade: 5,
      motivo: 'Nenhuma pesagem registrada',
      impacto: 'Registre pesagens periódicas para acompanhar o ganho de peso do rebanho.',
      payload: {},
      acknowledged: false,
      created_at: new Date().toISOString(),
    });
  }

  if (recomendacoes.length === 0) {
    recomendacoes.push({
      id: 'tudo-ok',
      prioridade: 5,
      motivo: 'Rebanho em dia! ✓',
      impacto: 'Nenhuma ação urgente identificada. Continue mantendo os registros atualizados.',
      payload: {},
      acknowledged: false,
      created_at: new Date().toISOString(),
    });
  }

  return recomendacoes;
};

export function useRecommendations(filters?: {
  prioridade?: number;
  acknowledged?: boolean;
  limit?: number;
}) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = gerarRecomendacoesFromStorage();
      const filtered = data.filter((recommendation) => {
        if (filters?.prioridade && recommendation.prioridade !== filters.prioridade) {
          return false;
        }
        if (filters?.acknowledged !== undefined && recommendation.acknowledged !== filters.acknowledged) {
          return false;
        }
        return true;
      });
      const limited = filters?.limit ? filtered.slice(0, filters.limit) : filtered;
      setRecommendations(limited);
      setTotal(limited.length);
    } catch (err) {
      console.warn('Dados não disponíveis, usando localStorage como fallback', err);
      setRecommendations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const acknowledge = async (id: string) => {
    setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, acknowledged: true } : r)));
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filters?.prioridade, filters?.acknowledged, filters?.limit]);

  return {
    recommendations,
    total,
    loading,
    fetchRecommendations,
    acknowledge,
  };
}
