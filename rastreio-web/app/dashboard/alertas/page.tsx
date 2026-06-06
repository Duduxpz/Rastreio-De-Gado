'use client';

import { useState, useEffect } from 'react';
import { useAlerts } from '@/hooks/useAnalyticsData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { gerarAlertas, type Alerta } from '@/utils/gerarAlertas';

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
  const [useApi, setUseApi] = useState(true);
  const [alertasLocal, setAlertasLocal] = useState<Alerta[]>([]);
  const [filtroNivel, setFiltroNivel] = useState<AlertNivel | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<AlertTipo | ''>('');
  const [filtroLida, setFiltroLida] = useState<'all' | 'lida' | 'nao-lida'>('nao-lida');

  const { alerts: alertsApi, loading: loadingApi, markAsRead } = useAlerts({
    nivel: (filtroNivel || undefined) as AlertNivel | undefined,
  });

  // Fallback para localStorage se a API não estiver disponível
  useEffect(() => {
    if (!useApi) {
      const animais = JSON.parse(localStorage.getItem('animais') || '[]');
      const vacinacoes = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
      const pesagens = JSON.parse(localStorage.getItem('pesagens') || '[]');
      const alertasGerados = gerarAlertas(animais, vacinacoes, pesagens);
      setAlertasLocal(alertasGerados);
    }
  }, [useApi]);

  const alertsFromApi: AlertApi[] = alertsApi || [];

  // Use API by default, fallback to local
  const alertsToDisplay = useApi ? alertsFromApi : alertasLocal;

  // Filtrar alertas
  let alertasFiltrados: any[] = alertsToDisplay;

  if (useApi) {
    // Filtrar alertas da API
    if (filtroNivel) {
      alertasFiltrados = alertasFiltrados.filter((a: AlertApi) => a.nivel === filtroNivel);
    }
    if (filtroTipo) {
      alertasFiltrados = alertasFiltrados.filter((a: AlertApi) => a.tipo === filtroTipo);
    }
    if (filtroLida === 'lida') {
      alertasFiltrados = alertasFiltrados.filter((a: AlertApi) => a.lida);
    }
    if (filtroLida === 'nao-lida') {
      alertasFiltrados = alertasFiltrados.filter((a: AlertApi) => !a.lida);
    }
  } else {
    // Filtrar alertas locais
    if (filtroNivel) {
      alertasFiltrados = alertasFiltrados.filter((a: Alerta) => a.tipo === filtroNivel);
    }
    if (filtroTipo) {
      alertasFiltrados = alertasFiltrados.filter((a: Alerta) => a.categoria === filtroTipo);
    }
  }

  const countByLevel = {
    CRITICAL: alertsFromApi?.filter((a) => a.nivel === 'CRITICAL').length || 0,
    WARNING: alertsFromApi?.filter((a) => a.nivel === 'WARNING').length || 0,
    INFO: alertsFromApi?.filter((a) => a.nivel === 'INFO').length || 0,
  };

  const countByType = {
    vacinacao: alertsFromApi?.filter((a) => a.tipo === 'vacinacao').length || 0,
    pesagem: alertsFromApi?.filter((a) => a.tipo === 'pesagem').length || 0,
    animal: alertsFromApi?.filter((a) => a.tipo === 'animal').length || 0,
    sistema: alertsFromApi?.filter((a) => a.tipo === 'sistema').length || 0,
  };

  const getLevelColor = (nivel: string) => {
    switch (nivel) {
      case 'CRITICAL':
        return 'bg-red-50 border-l-4 border-red-600 text-red-700';
      case 'WARNING':
        return 'bg-yellow-50 border-l-4 border-yellow-600 text-yellow-700';
      case 'INFO':
        return 'bg-blue-50 border-l-4 border-blue-600 text-blue-700';
      default:
        return '';
    }
  };

  const getLevelIcon = (nivel: string) => {
    switch (nivel) {
      case 'CRITICAL':
        return '🔴';
      case 'WARNING':
        return '🟡';
      case 'INFO':
        return '🔵';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Alertas do Rebanho" />

      {/* Toggle entre API e Local */}
      {!loadingApi && alertsFromApi && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              {useApi ? '✓ Conectado à API' : '📱 Usando dados locais'}
            </div>
            <button
              onClick={() => setUseApi(!useApi)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
            >
              Mudar fonte
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <Card variant="outlined">
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
                <option value="">Todos ({alertsFromApi.length})</option>
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
                <option value="">Todos ({alertsFromApi.length})</option>
                <option value="vacinacao">Vacinações ({countByType.vacinacao})</option>
                <option value="pesagem">Pesagens ({countByType.pesagem})</option>
                <option value="animal">Animais ({countByType.animal})</option>
                <option value="sistema">Sistema ({countByType.sistema})</option>
              </select>
            </div>
            {useApi && (
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
            )}
          </div>
        </div>
      </Card>

      {/* Lista de alertas */}
      {loadingApi ? (
        <LoadingState text="Carregando alertas..." />
      ) : alertasFiltrados.length === 0 ? (
        <EmptyState
          title="Nenhum alerta"
          description="Parabéns! Tudo está funcionando normalmente com a fazenda."
        />
      ) : (
        <div className="space-y-3">
          {alertasFiltrados.map((alerta) => {
            const isApi = useApi;
            const apiAlert = isApi ? (alerta as AlertApi) : null;
            const localAlert = !isApi ? (alerta as Alerta) : null;

            return (
              <Card
                key={alerta.id}
                variant="outlined"
                className={isApi && apiAlert ? getLevelColor(apiAlert.nivel) : ''}
              >
                <div className="p-4 flex items-start gap-4">
                  {/* Ícone */}
                  <span className="text-2xl flex-shrink-0">
                    {isApi && apiAlert
                      ? getLevelIcon(apiAlert.nivel)
                      : localAlert?.tipo === 'critico'
                      ? '🔴'
                      : '🟡'}
                  </span>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900">
                      {isApi && apiAlert ? apiAlert.titulo : localAlert?.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isApi && apiAlert ? apiAlert.descricao : localAlert?.descricao}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        label={
                          isApi && apiAlert
                            ? apiAlert.tipo
                            : localAlert?.categoria || ''
                        }
                        variant={
                          isApi && apiAlert
                            ? apiAlert.nivel === 'CRITICAL'
                              ? 'danger'
                              : apiAlert.nivel === 'WARNING'
                              ? 'warning'
                              : 'info'
                            : localAlert?.tipo === 'critico'
                            ? 'danger'
                            : 'warning'
                        }
                      />
                      {isApi && apiAlert && apiAlert.lida && (
                        <Badge label="Lido" variant="success" />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {isApi && apiAlert
                        ? new Date(apiAlert.created_at).toLocaleDateString('pt-BR')
                        : new Date(localAlert?.criadoEm || '').toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2">
                    {isApi && apiAlert && !apiAlert.lida && (
                      <Button
                        onClick={() => markAsRead(apiAlert.id)}
                        variant="secondary"
                        size="sm"
                      >
                        Marcar como lido
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
