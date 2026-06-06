'use client';

import { useState } from 'react';
import { useAlerts } from '@/hooks/useAnalyticsData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';

type AlertNivel = 'INFO' | 'WARNING' | 'CRITICAL';
type AlertTipo = 'vacinacao' | 'pesagem' | 'animal' | 'sistema';

interface AlertApi {
  id: string;
  tipo: AlertTipo;
  nivel: AlertNivel;
  titulo: string;
  descricao: string;
  lida: boolean;
  arquivada: boolean;
  created_at: string;
}

export default function AlertasPage() {
  const [filtroNivel, setFiltroNivel] = useState<AlertNivel | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<AlertTipo | ''>('');
  const [filtroLida, setFiltroLida] = useState<'all' | 'lida' | 'nao-lida'>('nao-lida');

  const { alerts: alertsApi, loading: loadingApi, markAsRead } = useAlerts({
    nivel: (filtroNivel || undefined) as AlertNivel | undefined,
  });

  const alertsData: AlertApi[] = alertsApi || [];

  // Filtrar alertas
  let alertasFiltrados = alertsData;

  if (filtroTipo) {
    alertasFiltrados = alertasFiltrados.filter((a) => a.tipo === filtroTipo);
  }

  if (filtroLida === 'lida') {
    alertasFiltrados = alertasFiltrados.filter((a) => a.lida);
  } else if (filtroLida === 'nao-lida') {
    alertasFiltrados = alertasFiltrados.filter((a) => !a.lida);
  }

  const countByLevel = {
    CRITICAL: alertsData.filter((a) => a.nivel === 'CRITICAL').length,
    WARNING: alertsData.filter((a) => a.nivel === 'WARNING').length,
    INFO: alertsData.filter((a) => a.nivel === 'INFO').length,
  };

  const countByType = {
    vacinacao: alertsData.filter((a) => a.tipo === 'vacinacao').length,
    pesagem: alertsData.filter((a) => a.tipo === 'pesagem').length,
    animal: alertsData.filter((a) => a.tipo === 'animal').length,
    sistema: alertsData.filter((a) => a.tipo === 'sistema').length,
  };

  const getLevelColor = (nivel: AlertNivel) => {
    switch (nivel) {
      case 'CRITICAL':
        return 'bg-red-50 border-l-4 border-red-600 text-red-700';
      case 'WARNING':
        return 'bg-yellow-50 border-l-4 border-yellow-600 text-yellow-700';
      case 'INFO':
        return 'bg-blue-50 border-l-4 border-blue-600 text-blue-700';
    }
  };

  const getLevelIcon = (nivel: AlertNivel) => {
    switch (nivel) {
      case 'CRITICAL':
        return '🔴';
      case 'WARNING':
        return '🟡';
      case 'INFO':
        return '🔵';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Alertas do Rebanho" />

      {/* Filtros */}
      <Card variant="bordered">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Nível
              </label>
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value as AlertNivel | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos ({alertsData.length})</option>
                <option value="CRITICAL">Críticos ({countByLevel.CRITICAL})</option>
                <option value="WARNING">Avisos ({countByLevel.WARNING})</option>
                <option value="INFO">Informativos ({countByLevel.INFO})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as AlertTipo | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos ({alertsData.length})</option>
                <option value="vacinacao">Vacinações ({countByType.vacinacao})</option>
                <option value="pesagem">Pesagens ({countByType.pesagem})</option>
                <option value="animal">Animais ({countByType.animal})</option>
                <option value="sistema">Sistema ({countByType.sistema})</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Status
              </label>
              <select
                value={filtroLida}
                onChange={(e) => setFiltroLida(e.target.value as 'all' | 'lida' | 'nao-lida')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="nao-lida">Não Lidos</option>
                <option value="lida">Lidos</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de alertas */}
      {loadingApi ? (
        <LoadingState message="Carregando alertas..." />
      ) : alertasFiltrados.length === 0 ? (
        <EmptyState
          title="Nenhum alerta"
          description="Parabéns! Tudo está funcionando normalmente com a fazenda."
        />
      ) : (
        <div className="space-y-3">
          {alertasFiltrados.map((alerta) => (
            <Card key={alerta.id} variant="bordered" className={getLevelColor(alerta.nivel)}>
              <div className="p-4 flex items-start gap-4">
                {/* Ícone */}
                <span className="text-2xl flex-shrink-0">{getLevelIcon(alerta.nivel)}</span>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900">{alerta.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alerta.descricao}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      label={alerta.tipo}
                      variant={
                        alerta.nivel === 'CRITICAL'
                          ? 'danger'
                          : alerta.nivel === 'WARNING'
                          ? 'warning'
                          : 'info'
                      }
                    />
                    {alerta.lida && <Badge label="Lido" variant="success" />}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(alerta.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  {!alerta.lida && (
                    <Button onClick={() => markAsRead(alerta.id)} variant="secondary">
                      Marcar como lido
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
