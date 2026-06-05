'use client';

import { Button } from '@/components/ui/Button';
import { QuickAction } from '@/components/ui/QuickAction';
import { StatCard } from '@/components/ui/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { BarChart3, Plus, Scale, Sprout, Syringe } from 'lucide-react';

export default function DashboardPage() {
  const stats = useDashboardStats();

  const mapTrendencia = (
    t: 'aumentando' | 'estavel' | 'diminuindo'
  ): 'up' | 'down' | 'neutral' => {
    if (t === 'aumentando') return 'up';
    if (t === 'diminuindo') return 'down';
    return 'neutral';
  };

  const mapTendenciaLabel = (
    t: 'aumentando' | 'estavel' | 'diminuindo'
  ): string => {
    if (t === 'aumentando') return 'Aumentando';
    if (t === 'diminuindo') return 'Diminuindo';
    return 'Estável';
  };

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
        <Button variant="primary">
          <Plus size={15} className="inline mr-2" />
          Novo Animal
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total de Animais"
          value={stats.totalAnimais}
          icon={Sprout}
          iconColor="text-brand-DEFAULT"
          iconBg="bg-brand-subtle"
          trend={mapTrendencia(stats.tendenciaAnimais)}
          trendLabel={mapTendenciaLabel(stats.tendenciaAnimais)}
        />
        <StatCard
          label="Vacinações Pendentes"
          value={stats.vacinacoesPendentes}
          icon={Syringe}
          iconColor="text-warning-DEFAULT"
          iconBg="bg-warning-subtle"
          trend={mapTrendencia(stats.tendenciaVacinacoes)}
          trendLabel={mapTendenciaLabel(stats.tendenciaVacinacoes)}
        />
        <StatCard
          label="Pesagens (30 dias)"
          value={stats.pesagens30Dias}
          icon={Scale}
          iconColor="text-info-DEFAULT"
          iconBg="bg-info-subtle"
          trend={mapTrendencia(stats.tendenciaPesagens)}
          trendLabel={mapTendenciaLabel(stats.tendenciaPesagens)}
        />
        <StatCard
          label="Total de Registros"
          value={stats.totalRegistros}
          icon={BarChart3}
          iconColor="text-cta-DEFAULT"
          iconBg="bg-cta-subtle"
          trend={mapTrendencia(stats.tendenciaRegistros)}
          trendLabel={mapTendenciaLabel(stats.tendenciaRegistros)}
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
            icon={Sprout}
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
