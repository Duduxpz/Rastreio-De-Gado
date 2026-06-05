'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { gerarAlertas, type Alerta } from '@/utils/gerarAlertas';

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  useEffect(() => {
    carregarAlertas();
    const interval = setInterval(carregarAlertas, 5000);
    window.addEventListener('storage', carregarAlertas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', carregarAlertas);
    };
  }, []);

  const carregarAlertas = () => {
    const animais = JSON.parse(localStorage.getItem('animais') || '[]');
    const vacinacoes = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
    const pesagens = JSON.parse(localStorage.getItem('pesagens') || '[]');
    const alertasGerados = gerarAlertas(animais, vacinacoes, pesagens);
    setAlertas(alertasGerados);
    setLoading(false);
  };

  const alertasFiltrados =
    filtroTipo === ''
      ? alertas
      : alertas.filter((a) => a.tipo === filtroTipo);

  const tipoLabels: Record<string, string> = {
    vacinacao: 'Vacinações',
    pesagem: 'Pesagens',
    animal: 'Animais',
    sistema: 'Sistema',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Alertas"
          description="Monitore eventos importantes da fazenda"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas"
        description="Monitore eventos importantes da fazenda"
      />

      {/* Filtro por tipo */}
      <Card className="p-6">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Filtrar por Tipo
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroTipo('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtroTipo === ''
                ? 'bg-cta-DEFAULT text-text-inverse'
                : 'border border-bg-border text-text-secondary hover:bg-bg-elevated'
            }`}
          >
            Todos ({alertas.length})
          </button>
          {Object.entries(tipoLabels).map(([tipo, label]) => {
            const count = alertas.filter((a) => a.tipo === tipo).length;
            return (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroTipo === tipo
                    ? 'bg-cta-DEFAULT text-text-inverse'
                    : 'border border-bg-border text-text-secondary hover:bg-bg-elevated'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Lista de alertas */}
      {alertasFiltrados.length === 0 ? (
        <EmptyState
          icon="✓"
          title="Nenhum alerta ativo"
          description="Tudo está funcionando normalmente com a fazenda"
        />
      ) : (
        <div className="space-y-3">
          {alertasFiltrados.map((alerta) => (
            <Card
              key={alerta.id}
              className={`p-6 ${
                alerta.tipo === 'critico'
                  ? 'border-l-4 border-red-600'
                  : 'border-l-4 border-yellow-600'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Ícone */}
                <span className="text-3xl flex-shrink-0">
                  {alerta.tipo === 'critico' ? '🔴' : '🟡'}
                </span>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3
                      className={`font-semibold text-sm ${
                        alerta.tipo === 'critico'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {alerta.titulo}
                    </h3>
                    <Badge
                      label={tipoLabels[alerta.categoria] || alerta.categoria}
                      variant={
                        alerta.tipo === 'critico' ? 'danger' : 'warning'
                      }
                    />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {alerta.descricao}
                  </p>
                  {alerta.animalBrinco && (
                    <p className="text-xs text-text-muted mt-2">
                      Animal: <span className="text-text-primary font-semibold">{alerta.animalBrinco}</span>
                    </p>
                  )}
                </div>

                {/* Ação */}
                {alerta.animalId && (
                  <a
                    href={`/dashboard/animais/${alerta.animalId}`}
                    className="px-3 py-1.5 rounded-lg bg-bg-elevated
                             text-xs font-medium text-cta-DEFAULT
                             hover:bg-bg-border transition-colors flex-shrink-0"
                  >
                    Ver animal
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
