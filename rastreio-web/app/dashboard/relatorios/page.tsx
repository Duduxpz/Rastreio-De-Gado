'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function RelatoriosPage() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAlertas();
  }, []);

  const carregarAlertas = async () => {
    try {
      setLoading(true);
      const alertasGerados: AlertaItem[] = [];

      // Buscar vacinações pendentes
      const hoje = new Date().toISOString().split('T')[0];
      const { data: vacinacoes } = await supabase
        .from('vacinacoes')
        .select('*')
        .lte('proxima_dose', hoje);

      if (vacinacoes && vacinacoes.length > 0) {
        vacinacoes.forEach((vac) => {
          alertasGerados.push({
            tipo: 'vacinacao',
            severity:
              vac.proxima_dose < hoje ? 'critical' : 'warning',
            titulo: `Vacinação Pendente - ${vac.vacina}`,
            descricao: `Esta vacinação está pendente desde ${new Date(vac.proxima_dose).toLocaleDateString('pt-BR')}`,
            data: vac.proxima_dose,
          });
        });
      }

      setAlertas(alertasGerados);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando relatórios..." />;
  }

  const COLORS = ['#1A7A4A', '#D97706', '#2563EB', '#059669', '#DC2626'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análise e estatísticas da fazenda"
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total de Animais</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalAnimais}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.animaisAtivos} ativos
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Vacinações</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalVacinacoes}
          </p>
          {stats.vacinacoesPendentes > 0 && (
            <Badge
              label={`${stats.vacinacoesPendentes} pendentes`}
              variant="warning"
            />
          )}
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Peso Médio</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.pesoMedio} kg
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalPesagens} pesagens registradas
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Peso por Animal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Peso por Animal (Top 10)
          </h3>
          {pesoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pesoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brinco" fontSize={12} />
                <YAxis />
                <Tooltip formatter={(v) => `${v} kg`} />
                <Bar dataKey="peso" fill="#1A7A4A" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum dado disponível
            </p>
          )}
        </Card>

        {/* Gráfico de Distribuição de Categorias */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Categorias
          </h3>
          {categoriaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum dado disponível
            </p>
          )}
        </Card>
      </div>

      {/* Recomendações */}
      <Card className="p-6 border-l-4 border-blue-500 bg-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ℹ️ Recomendações
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Realize pesagens regulares para monitorar o crescimento</li>
          <li>• Mantenha o calendário de vacinações sempre em dia</li>
          <li>• Revise os dados de cada animal mensalmente</li>
          <li>• Use os relatórios para tomar decisões de manejo</li>
        </ul>
      </Card>
    </div>
  );
}
