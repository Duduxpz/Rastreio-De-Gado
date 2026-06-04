'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { GraficoEvolucao } from '@/components/GraficoEvolucao';
import type { Animal, Vacinacao, Pesagem } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAnimais: 0,
    vacinacoesPendentes: 0,
    pesagensUltimas: 0,
    totalPesagens: 0,
  });
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [graficoData, setGraficoData] = useState<any[]>([]);

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

        // Processar gráfico
        const dataProcessada = (pesagensData || [])
          .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .map((p: any) => ({
            data: new Date(p.data).toLocaleDateString('pt-BR'),
            peso: p.peso,
          }))
          .slice(-30);

        setGraficoData(dataProcessada);

        // Gerar alertas
        const alertasGerados: any[] = [];
        if (vacinacaoData && vacinacaoData.length > 0) {
          alertasGerados.push({
            tipo: 'vacinacao',
            titulo: `${vacinacaoData.length} vacinações pendentes`,
            descricao: 'Existem animais que precisam ser vacinados em breve',
            severity: 'warning',
          });
        }

        setAlertas(alertasGerados);
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
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total de Animais"
          value={stats.totalAnimais}
          icon="🐄"
          trend="up"
        />
        <StatCard
          label="Vacinações Pendentes"
          value={stats.vacinacoesPendentes}
          icon="💉"
          trend={stats.vacinacoesPendentes > 0 ? 'down' : 'stable'}
        />
        <StatCard
          label="Pesagens (30 dias)"
          value={stats.pesagensUltimas}
          icon="⚖️"
          trend="up"
        />
        <StatCard
          label="Total de Registros"
          value={stats.totalPesagens}
          icon="📊"
          trend="up"
        />
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="p-6 border-l-4 border-yellow-500 bg-yellow-50">
          <h3 className="font-semibold text-gray-900 mb-4">🚨 Alertas Importantes</h3>
          <div className="space-y-3">
            {alertas.map((alerta, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Badge label={alerta.titulo} variant="warning" />
                <p className="text-sm text-gray-700">{alerta.descricao}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Gráfico de Evolução */}
      {graficoData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📈 Evolução de Peso (últimos 30 dias)</h3>
          <GraficoEvolucao dados={graficoData} />
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/dashboard/animais"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="text-2xl mb-2">🐄</div>
            <p className="text-sm font-medium text-gray-900">Ver Animais</p>
          </a>
          <a
            href="/dashboard/vacinacoes"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="text-2xl mb-2">💉</div>
            <p className="text-sm font-medium text-gray-900">Vacinações</p>
          </a>
          <a
            href="/dashboard/pesagens"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="text-2xl mb-2">⚖️</div>
            <p className="text-sm font-medium text-gray-900">Pesagens</p>
          </a>
          <a
            href="/dashboard/relatorios"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm font-medium text-gray-900">Relatórios</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
