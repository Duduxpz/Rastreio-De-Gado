'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuickAction } from '@/components/ui/QuickAction';
import { StatCard } from '@/components/ui/StatCard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { BarChart3, Plus, Scale, Sprout, Syringe, ShieldAlert, TrendingUp, Sparkles } from 'lucide-react';

const statusColor = (status: string) => {
  if (status === 'Excelente') return 'text-success-DEFAULT bg-success-subtle';
  if (status === 'Bom') return 'text-brand-DEFAULT bg-brand-subtle';
  if (status === 'Atenção') return 'text-warning-DEFAULT bg-warning-subtle';
  return 'text-danger-DEFAULT bg-danger-subtle';
};

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-1">
            Visão geral
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Insights inteligentes para a gestão do rebanho e prioridades de ação.
          </p>
        </div>
        <Button variant="primary">
          <Plus size={15} className="inline mr-2" />
          Novo Animal
        </Button>
      </div>

      {/* KPI Cards */}
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

      {/* Executive score and intelligence cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Rebanho Score</p>
              <p className="text-4xl font-semibold text-text-primary mt-3">{stats.rebanhoScore}</p>
            </div>
            <div className={`rounded-full px-3 py-2 text-sm font-semibold ${statusColor(stats.rebanhoStatus)}`}>
              {stats.rebanhoStatus}
            </div>
          </div>
          <p className="text-sm text-text-muted">
            Score geral do rebanho avaliado por vacinação, pesagem e cadastro.
          </p>
        </Card>

        <StatCard
          label="Animais sem pesagem recente"
          value={stats.topIssues.find((issue) => issue.key === 'pesagem')?.count ?? 0}
          icon={TrendingUp}
          iconColor="text-danger-DEFAULT"
          iconBg="bg-danger-subtle"
        />

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Peso médio</p>
              <p className="text-3xl font-semibold text-text-primary mt-3">
                {stats.avgPeso ? `${stats.avgPeso} kg` : '-'}
              </p>
            </div>
            <div className="rounded-xl bg-bg-elevated px-3 py-2 text-xs font-medium text-text-primary">
              Previsão 30 dias
            </div>
          </div>
          <p className="text-sm text-text-muted">
            Use o histórico para ajustar lotes e melhorar desempenho.
          </p>
        </Card>
      </div>

      {/* Smart recommendations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Atenção necessária</p>
              <p className="text-2xl font-semibold text-text-primary mt-2">{stats.topIssues.length}</p>
            </div>
            <ShieldAlert size={24} className="text-warning-DEFAULT" />
          </div>
          <p className="text-sm text-text-muted">
            Itens detectados com prioridade de ação para manter o rebanho saudável.
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-text-secondary mb-4">Oportunidades de melhoria</p>
          <ul className="space-y-3">
            {stats.topIssues.map((issue) => (
              <li key={issue.key} className="rounded-2xl border border-bg-border bg-bg-elevated p-4">
                <p className="text-sm font-semibold text-text-primary">{issue.message}</p>
                <p className="text-xs text-text-muted mt-1">Impacto esperado: reduzir riscos e melhorar produtividade.</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Alertas importantes</p>
              <p className="text-2xl font-semibold text-text-primary mt-2">
                {stats.vacinacoesPendentes + (stats.topIssues.find((issue) => issue.key === 'pesagem')?.count ?? 0)}
              </p>
            </div>
            <Sparkles size={24} className="text-brand-DEFAULT" />
          </div>
          <p className="text-sm text-text-muted">
            Acompanhe as recomendações automáticas pelo painel para ações rápidas.
          </p>
        </Card>
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
