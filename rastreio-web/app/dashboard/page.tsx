'use client';

import { useEffect, useState } from 'react';
import { Cow, Syringe, Scale, BarChart3, Plus } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { QuickAction } from '@/components/ui/QuickAction';
import { LoadingState } from '@/components/ui/LoadingState';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAnimais: 0,
    vacinacoesPendentes: 0,
    pesagensUltimas: 0,
    totalPesagens: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar animais
        const { data: animaisData, error: animaisErr } = await supabase
          .from('animais')
          .select('*');

        if (animaisErr) throw animaisErr;

        // Carregar vacinações
        const { data: vacinacaoData, error: vacErr } = await supabase
          .from('vacinacoes')
          .select('*')
          .gt('proxima_dose', new Date().toISOString().split('T')[0]);

        if (vacErr) throw vacErr;

        // Carregar pesagens
        const { data: pesagensData, error: pesErr } = await supabase
          .from('pesagens')
          .select('*')
          .gte('data', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        if (pesErr) throw pesErr;

        setStats({
          totalAnimais: animaisData?.length || 0,
          vacinacoesPendentes: vacinacaoData?.length || 0,
          pesagensUltimas: pesagensData?.length || 0,
          totalPesagens: pesagensData?.length || 0,
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (loading) {
    return <LoadingState message="Carregando dashboard..." />;
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-1">
            Visão geral
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Dashboard
          </h1>
        </div>
        <button className="
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-cta-DEFAULT text-text-inverse text-sm font-medium
          hover:bg-cta-light transition-colors
          shadow-[0_2px_12px_rgba(249,115,22,0.35)]
        ">
          <Plus size={15} />
          Novo Animal
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total de Animais"
          value={stats.totalAnimais}
          icon={Cow}
          iconColor="text-brand-DEFAULT"
          iconBg="bg-brand-subtle"
          trend="up"
          trendLabel="Aumentando"
        />
        <StatCard
          label="Vacinações Pendentes"
          value={stats.vacinacoesPendentes}
          icon={Syringe}
          iconColor="text-warning-DEFAULT"
          iconBg="bg-warning-subtle"
          trend="neutral"
          trendLabel="Estável"
        />
        <StatCard
          label="Pesagens (30 dias)"
          value={stats.pesagensUltimas}
          icon={Scale}
          iconColor="text-info-DEFAULT"
          iconBg="bg-info-subtle"
          trend="up"
          trendLabel="Aumentando"
        />
        <StatCard
          label="Total de Registros"
          value={stats.totalPesagens}
          icon={BarChart3}
          iconColor="text-cta-DEFAULT"
          iconBg="bg-cta-subtle"
          trend="up"
          trendLabel="Aumentando"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-3">
          Ações rápidas
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            href="/dashboard/animais"
            icon={Cow}
            label="Ver Animais"
            description="Gerenciar rebanho"
            accent
          />
          <QuickAction
            href="/dashboard/vacinacoes"
            icon={Syringe}
            label="Vacinações"
            description="Registros sanitários"
          />
          <QuickAction
            href="/dashboard/pesagens"
            icon={Scale}
            label="Pesagens"
            description="Controle de peso"
          />
          <QuickAction
            href="/dashboard/relatorios"
            icon={BarChart3}
            label="Relatórios"
            description="Exportar PDF / GTA"
          />
        </div>
      </div>

    </div>
  );
}
