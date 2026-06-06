'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalyticsData';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { snapshots, stats, loading, generateSnapshot } = useAnalytics({ limit: 30 });
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateSnapshot = async () => {
    await generateSnapshot();
    setHasGenerated(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Analytics do Rebanho" />
        <Button
          onClick={handleGenerateSnapshot}
          disabled={loading}
          variant="primary"
        >
          {loading ? 'Gerando...' : 'Gerar Snapshot'}
        </Button>
      </div>

      {loading && !hasGenerated ? (
        <LoadingState message="Carregando analytics..." />
      ) : snapshots.length === 0 ? (
        <EmptyState
          title="Sem dados de analytics"
          description="Gere um snapshot para começar a acompanhar a saúde do seu rebanho"
          action={{ label: 'Gerar Snapshot', onClick: handleGenerateSnapshot }}
        />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && (
              <>
                <Card variant="elevated" className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total de Animais</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAnimais}</p>
                  <p className="text-xs text-gray-500 mt-1">+{Math.round((stats.totalAnimais / Math.max(1, stats.totalAnimais)) * 100)}%</p>
                </Card>
                <Card variant="elevated" className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sem Pesagem Recente</p>
                  <p className="text-2xl font-bold text-red-600">{stats.animalsSemPesagemRecente}</p>
                  <p className="text-xs text-gray-500 mt-1">{Math.round((stats.animalsSemPesagemRecente / Math.max(1, stats.totalAnimais)) * 100)}%</p>
                </Card>
                <Card variant="elevated" className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vacinações Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.vacinacoesPendentes}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.vacinacoesPendentes > 0 ? 'Atenção' : 'Ok'}</p>
                </Card>
                <Card variant="elevated" className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Taxa de Saúde</p>
                  <p className="text-2xl font-bold text-primary-500">{stats.taxaSaude}%</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.taxaSaude >= 80 ? 'Saudável' : 'Revisar'}</p>
                </Card>
              </>
            )}
          </div>

          {/* Peso Médio Histórico */}
          {snapshots.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Evolução do Peso Médio
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={snapshots.map((s) => ({
                  date: new Date(s.created_at).toLocaleDateString('pt-BR'),
                  peso: s.avg_peso,
                  animais: s.total_animais,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#1A7A4A"
                    strokeWidth={2}
                    dot={{ fill: '#1A7A4A' }}
                    name="Peso Médio (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rebanho Score Histórico */}
          {snapshots.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Score de Saúde do Rebanho
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={snapshots.map((s) => ({
                  date: new Date(s.created_at).toLocaleDateString('pt-BR'),
                  score: s.rebanho_score,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip formatter={(value) => value} labelStyle={{ color: '#000' }} />
                  <Bar
                    dataKey="score"
                    fill="#1A7A4A"
                    name="Score (0-100)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Ultimas Snapshots */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Últimos Snapshots
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Total Animais
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Sem Pesagem
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Vacinações Pendentes
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Peso Médio
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {snapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(snapshot.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {snapshot.total_animais}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {snapshot.animais_sem_pesagem_recente}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {snapshot.vacinacoes_pendentes}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {snapshot.avg_peso?.toFixed(2)} kg
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            snapshot.rebanho_score >= 80
                              ? 'bg-green-100 text-green-800'
                              : snapshot.rebanho_score >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {snapshot.rebanho_score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
