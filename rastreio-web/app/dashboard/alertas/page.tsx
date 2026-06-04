'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Animal } from '@/types';

interface AlertaItem {
  tipo: 'vacinacao' | 'saude' | 'peso';
  severity: 'critical' | 'warning' | 'info';
  titulo: string;
  descricao: string;
  animal?: Animal;
  data?: string;
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('');

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
        const { data: animais } = await supabase
          .from('animais')
          .select('*')
          .in(
            'id',
            vacinacoes.map((v) => v.animal_id)
          );

        vacinacoes.forEach((vac) => {
          const animal = animais?.find((a) => a.id === vac.animal_id);
          const diasAtraso = Math.floor(
            (new Date(hoje).getTime() -
              new Date(vac.proxima_dose).getTime()) /
              (1000 * 60 * 60 * 24)
          );

          alertasGerados.push({
            tipo: 'vacinacao',
            severity:
              diasAtraso > 30
                ? 'critical'
                : diasAtraso > 7
                  ? 'warning'
                  : 'info',
            titulo: `Vacinação Atrasada - ${vac.vacina}`,
            descricao: `Brinco ${animal?.brinco} está ${diasAtraso} dias atrasado na vacinação`,
            animal,
            data: vac.proxima_dose,
          });
        });
      }

      // Buscar animais com peso baixo
      const { data: animaisBaixoPeso } = await supabase
        .from('animais')
        .select('*')
        .lt('peso_atual', 100);

      if (animaisBaixoPeso && animaisBaixoPeso.length > 0) {
        animaisBaixoPeso.forEach((animal) => {
          alertasGerados.push({
            tipo: 'peso',
            severity: 'warning',
            titulo: 'Peso Abaixo do Normal',
            descricao: `Brinco ${animal.brinco} está com peso de ${animal.peso_atual} kg`,
            animal,
          });
        });
      }

      // Ordenar por severidade
      const severidadeOrder = { critical: 0, warning: 1, info: 2 };
      alertasGerados.sort(
        (a, b) =>
          severidadeOrder[a.severity] - severidadeOrder[b.severity]
      );

      setAlertas(alertasGerados);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const alertasFiltrados = alertas.filter((a) => {
    if (filtroSeveridade === '') return true;
    return a.severity === filtroSeveridade;
  });

  if (loading) {
    return <LoadingState message="Carregando alertas..." />;
  }

  const variantMap = {
    critical: 'danger' as const,
    warning: 'warning' as const,
    info: 'info' as const,
  };

  const iconMap = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        description="Monitore eventos importantes da fazenda"
      />

      {/* Filtro */}
      <Card className="p-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Filtrar por Severidade
        </label>
        <div className="flex gap-2">
          {['', 'critical', 'warning', 'info'].map((sev) => (
            <Button
              key={sev}
              variant={filtroSeveridade === sev ? 'primary' : 'ghost'}
              onClick={() => setFiltroSeveridade(sev)}
            >
              {sev === ''
                ? 'Todos'
                : sev === 'critical'
                  ? 'Críticos'
                  : sev === 'warning'
                    ? 'Avisos'
                    : 'Informativos'}
            </Button>
          ))}
        </div>
      </Card>

      {/* Alertas */}
      {alertasFiltrados.length === 0 ? (
        <EmptyState
          icon="✨"
          title="Sem alertas"
          description="Tudo está funcionando perfeitamente na sua fazenda!"
        />
      ) : (
        <div className="space-y-4">
          {alertasFiltrados.map((alerta, idx) => (
            <Card
              key={idx}
              className={`p-6 border-l-4 ${
                alerta.severity === 'critical'
                  ? 'border-danger-DEFAULT bg-danger-subtle'
                  : alerta.severity === 'warning'
                    ? 'border-warning-DEFAULT bg-warning-subtle'
                    : 'border-info-DEFAULT bg-info-subtle'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {iconMap[alerta.severity]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {alerta.titulo}
                    </h3>
                    <Badge
                      label={alerta.severity.toUpperCase()}
                      variant={variantMap[alerta.severity]}
                    />
                  </div>
                  <p className="text-text-secondary mb-3">{alerta.descricao}</p>
                  {alerta.animal && (
                    <div className="text-sm text-text-muted">
                      <p>
                        <strong>Animal:</strong> Brinco {alerta.animal.brinco} -{' '}
                        {alerta.animal.raca}
                      </p>
                      {alerta.data && (
                        <p>
                          <strong>Data:</strong>{' '}
                          {new Date(alerta.data).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                  {alerta.tipo === 'vacinacao' && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (alerta.animal) {
                          window.location.href = `/dashboard/animais/${alerta.animal.id}`;
                        }
                      }}
                      className="mt-3"
                    >
                      Ver Animal
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Resumo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          📊 Resumo de Alertas
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-danger-DEFAULT">
              {alertas.filter((a) => a.severity === 'critical').length}
            </p>
            <p className="text-sm text-text-muted">Críticos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning-DEFAULT">
              {alertas.filter((a) => a.severity === 'warning').length}
            </p>
            <p className="text-sm text-text-muted">Avisos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-info-DEFAULT">
              {alertas.filter((a) => a.severity === 'info').length}
            </p>
            <p className="text-sm text-text-muted">Informativos</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
