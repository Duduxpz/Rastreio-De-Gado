import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalAnimais: number;
  vacinacoesPendentes: number;
  pesagens30Dias: number;
  totalRegistros: number;
  tendenciaAnimais: 'aumentando' | 'estavel' | 'diminuindo';
  tendenciaVacinacoes: 'aumentando' | 'estavel' | 'diminuindo';
  tendenciaPesagens: 'aumentando' | 'estavel' | 'diminuindo';
  tendenciaRegistros: 'aumentando' | 'estavel' | 'diminuindo';
}

export const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimais: 0,
    vacinacoesPendentes: 0,
    pesagens30Dias: 0,
    totalRegistros: 0,
    tendenciaAnimais: 'estavel',
    tendenciaVacinacoes: 'estavel',
    tendenciaPesagens: 'estavel',
    tendenciaRegistros: 'estavel',
  });

  const calcularStats = () => {
    // — Animais —
    const animaisStr = typeof window !== 'undefined' ? localStorage.getItem('animais') : null;
    const animais = animaisStr ? JSON.parse(animaisStr) : [];
    const totalAnimais = animais.length;

    // — Vacinações pendentes —
    const vacinacoesStr = typeof window !== 'undefined' ? localStorage.getItem('vacinacoes') : null;
    const vacinacoes = vacinacoesStr ? JSON.parse(vacinacoesStr) : [];
    const vacinacoesPendentes = vacinacoes.filter(
      (v: any) => !v.dataAplicacao || v.status === 'pendente'
    ).length;

    // — Pesagens nos últimos 30 dias —
    const pesagensStr = typeof window !== 'undefined' ? localStorage.getItem('pesagens') : null;
    const pesagens = pesagensStr ? JSON.parse(pesagensStr) : [];
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const pesagens30Dias = pesagens.filter((p: any) => {
      if (!p.data) return false;
      return new Date(p.data) >= trintaDiasAtras;
    }).length;

    // — Total de registros (tudo) —
    const totalRegistros = totalAnimais + vacinacoes.length + pesagens.length;

    // — Tendências —
    // Compara com snapshot salvo anteriormente
    const snapshotAnterior = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('dashboard_snapshot') || '{}')
      : {};

    const calcTendencia = (
      atual: number,
      anterior: number | undefined
    ): 'aumentando' | 'estavel' | 'diminuindo' => {
      if (anterior === undefined) return 'estavel';
      if (atual > anterior) return 'aumentando';
      if (atual < anterior) return 'diminuindo';
      return 'estavel';
    };

    const tendenciaAnimais = calcTendencia(totalAnimais, snapshotAnterior.totalAnimais);
    const tendenciaVacinacoes = calcTendencia(
      vacinacoesPendentes,
      snapshotAnterior.vacinacoesPendentes
    );
    const tendenciaPesagens = calcTendencia(pesagens30Dias, snapshotAnterior.pesagens30Dias);
    const tendenciaRegistros = calcTendencia(totalRegistros, snapshotAnterior.totalRegistros);

    // Salvar snapshot atual
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
      tendenciaAnimais,
      tendenciaVacinacoes,
      tendenciaPesagens,
      tendenciaRegistros,
    });
  };

  useEffect(() => {
    // Calcular na montagem
    calcularStats();

    // Recalcular sempre que o localStorage mudar (outro evento storage ou manual dispatch)
    const handleStorageChange = () => calcularStats();
    window.addEventListener('storage', handleStorageChange);

    // Recalcular a cada 2 segundos (para mudanças na mesma aba)
    const interval = setInterval(calcularStats, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return stats;
};
