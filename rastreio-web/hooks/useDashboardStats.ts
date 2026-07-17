import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const toDateSafe = (value: unknown) => {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};


export interface DashboardIssue {
  key: string;
  count: number;
  message: string;
}

export interface DashboardStats {
  totalAnimais: number;
  vacinacoesPendentes: number;
  pesagens30Dias: number;
  totalRegistros: number;
  avgPeso: number | null;
  rebanhoScore: number;
  rebanhoStatus: 'Excelente' | 'Bom' | 'Atenção' | 'Crítico';
  topIssues: DashboardIssue[];
  tendenciaAnimais: 'aumentando' | 'estavel' | 'diminuindo';
  tendenciaVacinacoes: 'aumentando' | 'estavel' | 'diminuindo';
  tendenciaPesagens: 'aumentando' | 'estavel' | 'diminuindo';
  tendenciaRegistros: 'aumentando' | 'estavel' | 'diminuindo';
}

const getRebanhoStatus = (score: number) => {
  if (score >= 90) return 'Excelente';
  if (score >= 70) return 'Bom';
  if (score >= 50) return 'Atenção';
  return 'Crítico';
};

const getTopIssues = (
  animaisSemPesagemRecente: number,
  vacinacoesPendentes: number,
  totalAnimais: number
): DashboardIssue[] => {
  const issues: DashboardIssue[] = [];
  if (animaisSemPesagemRecente > 0) {
    issues.push({
      key: 'pesagem',
      count: animaisSemPesagemRecente,
      message: `Realizar pesagem em ${animaisSemPesagemRecente} animal${animaisSemPesagemRecente === 1 ? '' : 'es'} sem registro recente`,
    });
  }
  if (vacinacoesPendentes > 0) {
    issues.push({
      key: 'vacinas',
      count: vacinacoesPendentes,
      message: `Atualizar vacinação de ${vacinacoesPendentes} animal${vacinacoesPendentes === 1 ? '' : 'es'}`,
    });
  }
  if (issues.length === 0 && totalAnimais > 0) {
    issues.push({
      key: 'ok',
      count: 0,
      message: 'Rebanho está estável. Continue com pesagens e monitoramento regular.',
    });
  }
  return issues;
};

const computeScore = (
  totalAnimais: number,
  animaisSemPesagemRecente: number,
  vacinacoesPendentes: number,
  missingCadastro: number
) => {
  if (totalAnimais === 0) return 0;
  let score = 100;
  const pctSemPesagem = (animaisSemPesagemRecente / totalAnimais) * 100;
  const pctVacinas = (vacinacoesPendentes / Math.max(1, totalAnimais)) * 100;
  const pctMissing = (missingCadastro / totalAnimais) * 100;
  score -= Math.min(40, Math.round(pctSemPesagem * 0.8));
  score -= Math.min(30, Math.round(pctVacinas * 0.6));
  score -= Math.min(15, Math.round(pctMissing * 0.3));
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimais: 0,
    vacinacoesPendentes: 0,
    pesagens30Dias: 0,
    totalRegistros: 0,
    avgPeso: null,
    rebanhoScore: 0,
    rebanhoStatus: 'Crítico',
    topIssues: [],
    tendenciaAnimais: 'estavel',
    tendenciaVacinacoes: 'estavel',
    tendenciaPesagens: 'estavel',
    tendenciaRegistros: 'estavel',
  });

  const calcTendencia = (
    atual: number,
    anterior: number | undefined
  ): 'aumentando' | 'estavel' | 'diminuindo' => {
    if (anterior === undefined) return 'estavel';
    if (atual > anterior) return 'aumentando';
    if (atual < anterior) return 'diminuindo';
    return 'estavel';
  };

  const calcularStats = async () => {
    if (typeof window === 'undefined') return;

    try {
      const [{ data: animaisData, error: animaisError }, { data: vacinacoesData, error: vacinacoesError }, { data: pesagensData, error: pesagensError }] = await Promise.all([
        supabase.from('animais').select('*').eq('ativo', true),
        supabase.from('vacinacoes').select('*'),
        supabase.from('pesagens').select('*'),
      ]);

      if (animaisError || vacinacoesError || pesagensError) {
        throw new Error('Não foi possível carregar os dados do dashboard.');
      }

      const animais = (animaisData || []) as Array<{ id: string; peso_atual?: number; raca?: string; lote?: string }>;
      const vacinacoes = (vacinacoesData || []) as Array<{ data?: string }>;
      const pesagens = (pesagensData || []) as Array<{ animal_id?: string; data?: string }>;
      const totalAnimais = animais.length;
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      const pesagens30Dias = pesagens.filter((p) => {
        const d = toDateSafe(p.data);
        return d ? d >= trintaDiasAtras : false;
      }).length;
      const vacinacoesPendentes = vacinacoes.filter((v) => {
        if (!v.data) return true;
        return String(v.data).trim() === '';
      }).length;
      const animaisSemPesagemRecente = animais.filter((animal) => {
        return !pesagens.some((p) => {
          if (p.animal_id !== animal.id) return false;
          const d = toDateSafe(p.data);
          return d ? d >= trintaDiasAtras : false;
        });
      }).length;

      const totalRegistros = totalAnimais + vacinacoes.length + pesagens.length;
      const avgPeso = (() => {
        let sum = 0;
        let count = 0;
        animais.forEach((animal) => {
          if (animal.peso_atual) {
            sum += Number(animal.peso_atual);
            count += 1;
          }
        });
        return count ? +(sum / count).toFixed(2) : null;
      })();
      const missingCadastro = animais.filter((animal) => !animal.raca || !animal.lote).length;
      const rebanhoScore = computeScore(totalAnimais, animaisSemPesagemRecente, vacinacoesPendentes, missingCadastro);
      const rebanhoStatus = getRebanhoStatus(rebanhoScore);
      const snapshotAnterior = JSON.parse(localStorage.getItem('dashboard_snapshot') || '{}');
      const tendenciaAnimais = calcTendencia(totalAnimais, snapshotAnterior.totalAnimais);
      const tendenciaVacinacoes = calcTendencia(vacinacoesPendentes, snapshotAnterior.vacinacoesPendentes);
      const tendenciaPesagens = calcTendencia(pesagens30Dias, snapshotAnterior.pesagens30Dias);
      const tendenciaRegistros = calcTendencia(totalRegistros, snapshotAnterior.totalRegistros);

      localStorage.setItem('dashboard_snapshot', JSON.stringify({
        totalAnimais,
        vacinacoesPendentes,
        pesagens30Dias,
        totalRegistros,
      }));

      setStats({
        totalAnimais,
        vacinacoesPendentes,
        pesagens30Dias,
        totalRegistros,
        avgPeso,
        rebanhoScore,
        rebanhoStatus,
        topIssues: getTopIssues(animaisSemPesagemRecente, vacinacoesPendentes, totalAnimais),
        tendenciaAnimais,
        tendenciaVacinacoes,
        tendenciaPesagens,
        tendenciaRegistros,
      });
    } catch {
      setStats((current) => current);
    }
  };

  useEffect(() => {
    void calcularStats();

    const handleRefresh = () => {
      void calcularStats();
    };

    window.addEventListener('dashboard:refresh', handleRefresh);
    window.addEventListener('storage', handleRefresh);

    const interval = window.setInterval(() => {
      void calcularStats();
    }, 5000);

    return () => {
      window.removeEventListener('dashboard:refresh', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
      clearInterval(interval);
    };
  }, []);

  return stats;
};
