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

interface AlertaItem {
  tipo: 'vacinacao' | 'pesagem';
  severity: 'critical' | 'warning' | 'info';
  titulo: string;
  descricao: string;
  data: string;
}

interface StatsData {
  totalAnimais: number;
  animaisAtivos: number;
  totalVacinacoes: number;
  vacinacoesPendentes: number;
  pesoMedio: number;
  totalPesagens: number;
}

interface PesoItem {
  brinco: string;
  peso: number;
}

interface CategoriaItem {
  name: string;
  value: number;
}

export default function RelatoriosPage() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalAnimais: 0,
    animaisAtivos: 0,
    totalVacinacoes: 0,
    vacinacoesPendentes: 0,
    pesoMedio: 0,
    totalPesagens: 0,
  });
  const [pesoData, setPesoData] = useState<PesoItem[]>([]);
  const [categoriaData, setCategoriaData] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // 1. Carregar animais
      const { data: animais } = await supabase.from('animais').select('*');

      // 2. Carregar vacinações
      const { data: vacinacoes } = await supabase.from('vacinacoes').select('*');

      // 3. Carregar pesagens
      const { data: pesagens } = await supabase.from('pesagens').select('*, animais(brinco)');

      const hoje = new Date().toISOString().split('T')[0];
      const alertasGerados: AlertaItem[] = [];

      // Calcular stats
      const totalAnimais = animais?.length || 0;
      const animaisAtivos = animais?.filter(a => a.ativo).length || 0;
      const totalVacinacoes = vacinacoes?.length || 0;
      const vacinacoesPendentes = vacinacoes?.filter(v => v.proxima_dose && v.proxima_dose <= hoje).length || 0;
      const totalPesagens = pesagens?.length || 0;

      // Calcular peso médio
      let pesoMedio = 0;
      if (pesagens && pesagens.length > 0) {
        const totalPeso = pesagens.reduce((sum, p) => sum + (p.peso || 0), 0);
        pesoMedio = Math.round(totalPeso / pesagens.length);
      }

      setStats({
        totalAnimais,
        animaisAtivos,
        totalVacinacoes,
        vacinacoesPendentes,
        pesoMedio,
        totalPesagens,
      });

      // Preparar dados para gráfico de peso
      if (pesagens) {
        const pesoPorAnimal: Record<string, number> = {};
        pesagens.forEach(p => {
          const brinco = p.animais?.brinco || 'Desconhecido';
          pesoPorAnimal[brinco] = p.peso;
        });
        const pesoDataArray = Object.entries(pesoPorAnimal)
          .map(([brinco, peso]) => ({ brinco, peso }))
          .sort((a, b) => b.peso - a.peso)
          .slice(0, 10);
        setPesoData(pesoDataArray);
      }

      // Preparar dados para gráfico de categorias
      if (animais) {
        const categorias: Record<string, number> = {};
        animais.forEach(a => {
          const cat = a.categoria || 'Outro';
          categorias[cat] = (categorias[cat] || 0) + 1;
        });
        const categoriaDataArray = Object.entries(categorias).map(([name, value]) => ({ name, value }));
        setCategoriaData(categoriaDataArray);
      }

      // Gerar alertas de vacinação pendente
      if (vacinacoes && vacinacoes.length > 0) {
        vacinacoes.forEach((vac) => {
          if (vac.proxima_dose && vac.proxima_dose <= hoje) {
            alertasGerados.push({
              tipo: 'vacinacao',
              severity: vac.proxima_dose < hoje ? 'critical' : 'warning',
              titulo: `Vacinação Pendente - ${vac.vacina}`,
              descricao: `Esta vacinação está pendente desde ${new Date(vac.proxima_dose).toLocaleDateString('pt-BR')}`,
              data: vac.proxima_dose,
            });
          }
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

  const COLORS = ['#121F2D', '#4C7BA6', '#80A1C3', '#B4C7DE', '#DDE7F2'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análise e estatísticas da fazenda"
      />

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-primary-100 mb-2">Total de Animais</p>
          <p className="text-3xl font-bold text-white">
            {stats.totalAnimais}
          </p>
          <p className="text-xs text-primary-200 mt-2">
            {stats.animaisAtivos} ativos
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-primary-100 mb-2">Vacinações</p>
          <p className="text-3xl font-bold text-white">
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
          <p className="text-sm text-primary-100 mb-2">Peso Médio</p>
          <p className="text-3xl font-bold text-white">
            {stats.pesoMedio} kg
          </p>
          <p className="text-xs text-primary-200 mt-2">
            {stats.totalPesagens} pesagens registradas
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Peso por Animal */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Peso por Animal (Top 10)
          </h3>
          {pesoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pesoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#80A1C3" />
                <XAxis dataKey="brinco" fontSize={12} stroke="#DDE7F2" />
                <YAxis stroke="#DDE7F2" />
                <Tooltip formatter={(v) => `${v} kg`} contentStyle={{ backgroundColor: '#0E1924', borderColor: '#0B141C', color: '#fff' }} />
                <Bar dataKey="peso" fill="#80A1C3" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-primary-300 text-center py-8">
              Nenhum dado disponível
            </p>
          )}
        </Card>

        {/* Gráfico de Distribuição de Categorias */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
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
                  fill="#80A1C3"
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0E1924', borderColor: '#0B141C', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-primary-300 text-center py-8">
              Nenhum dado disponível
            </p>
          )}
        </Card>
      </div>

      {/* Recomendações */}
      <Card className="p-6 border-l-4 border-primary-300 bg-primary-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          ℹ️ Recomendações
        </h3>
        <ul className="space-y-2 text-sm text-primary-100">
          <li>• Realize pesagens regulares para monitorar o crescimento</li>
          <li>• Mantenha o calendário de vacinações sempre em dia</li>
          <li>• Revise os dados de cada animal mensalmente</li>
          <li>• Use os relatórios para tomar decisões de manejo</li>
        </ul>
      </Card>
    </div>
  );
}
