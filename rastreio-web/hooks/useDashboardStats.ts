import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

  const calcularStats = () => {
    const animaisStr = typeof window !== 'undefined' ? localStorage.getItem('animais') : null;
    const animais = animaisStr ? JSON.parse(animaisStr) : [];
    const totalAnimais = animais.length;

    const vacinacoesStr = typeof window !== 'undefined' ? localStorage.getItem('vacinacoes') : null;
    const vacinacoes = vacinacoesStr ? JSON.parse(vacinacoesStr) : [];
    const vacinacoesPendentes = vacinacoes.filter(
      (v: any) => !v.dataAplicacao || v.status === 'pendente'
    ).length;

    const pesagensStr = typeof window !== 'undefined' ? localStorage.getItem('pesagens') : null;
    const pesagens = pesagensStr ? JSON.parse(pesagensStr) : [];
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const pesagens30Dias = pesagens.filter((p: any) => p.data && new Date(p.data) >= trintaDiasAtras).length;

    const totalRegistros = totalAnimais + vacinacoes.length + pesagens.length;

    const avgPeso = (() => {
      let sum = 0;
      let count = 0;
      animais.forEach((a: any) => {
        if (a.peso_atual) {
          sum += Number(a.peso_atual);
          count += 1;
        }
      });
      return count ? +(sum / count).toFixed(2) : null;
    })();

    const missingCadastro = animais.filter((a: any) => !a.raca || !a.lote).length;
    const rebanhoScore = computeScore(totalAnimais, totalAnimais - pesagens30Dias, vacinacoesPendentes, missingCadastro);
    const rebanhoStatus = getRebanhoStatus(rebanhoScore);

    const snapshotAnterior = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('dashboard_snapshot') || '{}')
      : {};

    const tendenciaAnimais = calcTendencia(totalAnimais, snapshotAnterior.totalAnimais);
    const tendenciaVacinacoes = calcTendencia(vacinacoesPendentes, snapshotAnterior.vacinacoesPendentes);
    const tendenciaPesagens = calcTendencia(pesagens30Dias, snapshotAnterior.pesagens30Dias);
    const tendenciaRegistros = calcTendencia(totalRegistros, snapshotAnterior.totalRegistros);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'dashboard_snapshot',
        JSON.stringify({
          totalAnimais,
          vacinacoesPendentes,
          pesagens30Dias,
          totalRegistros,
        })
      );
    }

    setStats({
      totalAnimais,
      vacinacoesPendentes,
      pesagens30Dias,
      totalRegistros,
      avgPeso,
      rebanhoScore,
      rebanhoStatus,
      topIssues: getTopIssues(totalAnimais - pesagens30Dias, vacinacoesPendentes, totalAnimais),
      tendenciaAnimais,
      tendenciaVacinacoes,
      tendenciaPesagens,
      tendenciaRegistros,
    });
  };

  useEffect(() => {
    calcularStats();

    const fetchServerStats = async () => {
      if (typeof window === 'undefined') return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        if (!token) return;

        const response = await fetch(`${apiUrl}/api/analytics/overview?days=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const json = await response.json();

        const animaisStr = localStorage.getItem('animais');
        const animais = animaisStr ? JSON.parse(animaisStr) : [];
        const totalAnimais = json.total_animais ?? animais.length;

        const pesagensStr = localStorage.getItem('pesagens');
        const pesagens = pesagensStr ? JSON.parse(pesagensStr) : [];
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        const pesagens30Dias = pesagens.filter((p: any) => p.data && new Date(p.data) >= trintaDiasAtras).length;

        const totalRegistros = totalAnimais + pesagens.length + (localStorage.getItem('vacinacoes') ? JSON.parse(localStorage.getItem('vacinacoes') || '[]').length : 0);
        const avgPeso = json.avg_peso ?? null;
        const rebanhoScore = json.rebanho_score ?? computeScore(totalAnimais, json.animais_sem_pesagem_recente ?? 0, json.vacinacoes_pendentes ?? 0, animais.filter((a: any) => !a.raca || !a.lote).length);
        const topIssues = (json.top_issues as DashboardIssue[] | undefined)
          ?? getTopIssues(json.animais_sem_pesagem_recente ?? 0, json.vacinacoes_pendentes ?? 0, totalAnimais);

        const snapshotAnterior = localStorage.getItem('dashboard_snapshot')
          ? JSON.parse(localStorage.getItem('dashboard_snapshot') || '{}')
          : {};

        setStats({
          totalAnimais,
          vacinacoesPendentes: json.vacinacoes_pendentes ?? 0,
          pesagens30Dias,
          totalRegistros,
          avgPeso,
          rebanhoScore,
          rebanhoStatus: getRebanhoStatus(rebanhoScore),
          topIssues,
          tendenciaAnimais: calcTendencia(totalAnimais, snapshotAnterior.totalAnimais),
          tendenciaVacinacoes: calcTendencia(json.vacinacoes_pendentes ?? 0, snapshotAnterior.vacinacoesPendentes),
          tendenciaPesagens: calcTendencia(pesagens30Dias, snapshotAnterior.pesagens30Dias),
          tendenciaRegistros: calcTendencia(totalRegistros, snapshotAnterior.totalRegistros),
        });

        localStorage.setItem('dashboard_snapshot', JSON.stringify({
          totalAnimais,
          vacinacoesPendentes: json.vacinacoes_pendentes ?? 0,
          pesagens30Dias,
          totalRegistros,
        }));
      } catch (error) {
        // fallback to local stats
      }
    };

    fetchServerStats();

    const handleStorageChange = () => calcularStats();
    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(calcularStats, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return stats;
};
