'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { gerarAlertas, type Alerta } from '@/utils/gerarAlertas';

export default function RelatoriosPage() {
  const [animais, setAnimais] = useState<any[]>([]);
  const [vacinacoes, setVacinacoes] = useState<any[]>([]);
  const [pesagens, setPesagens] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const a = JSON.parse(localStorage.getItem('animais') || '[]');
    const v = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
    const p = JSON.parse(localStorage.getItem('pesagens') || '[]');

    setAnimais(a);
    setVacinacoes(v);
    setPesagens(p);
    setAlertas(gerarAlertas(a, v, p));
    setLoading(false);
  };

  const totalAplicadas = vacinacoes.filter(
    (v) => v.status === 'aplicada'
  ).length;
  const totalPendentes = vacinacoes.filter(
    (v) => v.status === 'pendente'
  ).length;

  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const pesagensMes = pesagens.filter((p) => {
    const data = p.data ? new Date(p.data) : null;
    return data && data >= inicioMes;
  }).length;

  const handleExportarPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Relatórios"
          description="Carregando dados..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Relatórios"
          description="Visão consolidada do rebanho"
        />
        <Button
          variant="primary"
          onClick={handleExportarPDF}
          className="print:hidden"
        >
          ↓ Exportar PDF
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Animais */}
        <Card className="p-6">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Total de Animais
          </p>
          <p className="text-3xl font-bold text-text-primary">
            {animais.length}
          </p>
        </Card>

        {/* Vacinações */}
        <Card className="p-6">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Vacinações
          </p>
          <div className="space-y-1">
            <p className="text-sm text-green-400">
              ✓ {totalAplicadas} aplicadas
            </p>
            <p className="text-sm text-yellow-500">
              ⏳ {totalPendentes} pendentes
            </p>
          </div>
        </Card>

        {/* Pesagens Mês */}
        <Card className="p-6">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Pesagens (Mês)
          </p>
          <p className="text-3xl font-bold text-text-primary">
            {pesagensMes}
          </p>
        </Card>

        {/* Alertas Ativos */}
        <Card
          className={`p-6 ${
            alertas.length > 0 ? 'border-yellow-600/30' : 'border-green-600/30'
          }`}
        >
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Alertas Ativos
          </p>
          <p
            className={`text-3xl font-bold ${
              alertas.length > 0 ? 'text-yellow-500' : 'text-green-400'
            }`}
          >
            {alertas.length}
          </p>
        </Card>
      </div>

      {/* Seção Animais */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Animais
        </h2>
        {animais.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhum animal cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Brinco
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Raça
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Sexo
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Peso (kg)
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Lote
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Pasto
                  </th>
                </tr>
              </thead>
              <tbody>
                {animais.map((a, idx) => (
                  <tr
                    key={a.id || idx}
                    className="border-b border-bg-border/50 hover:bg-bg-elevated/30"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {a.brinco || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {a.raca || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {a.sexo === 'M' || a.sexo === 'Macho'
                        ? 'M'
                        : a.sexo === 'F' || a.sexo === 'Fêmea'
                          ? 'F'
                          : a.sexo || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {a.categoria ? (
                        <Badge
                          label={a.categoria}
                          variant={
                            a.categoria === 'vaca' || a.categoria === 'Vaca'
                              ? 'success'
                              : a.categoria === 'touro' ||
                                  a.categoria === 'Touro'
                                ? 'warning'
                                : 'info'
                          }
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {a.peso || a.peso_atual ? `${a.peso || a.peso_atual} kg` : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {a.lote || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {a.pasto || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Seção Vacinações */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Vacinações
        </h2>
        {vacinacoes.length === 0 ? (
          <p className="text-sm text-text-muted">
            Nenhuma vacinação registrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Animal
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Vacina
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Data Aplicação
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Vencimento
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Responsável
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {vacinacoes.map((v, idx) => (
                  <tr
                    key={v.id || idx}
                    className="border-b border-bg-border/50 hover:bg-bg-elevated/30"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {v.animalBrinco || v.animal_id || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {v.vacina || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {v.dataAplicacao || v.data || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {v.dataVencimento || v.proxima_dose || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {v.veterinario || v.responsavel || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={
                          v.status === 'aplicada' || v.data
                            ? 'Aplicada'
                            : 'Pendente'
                        }
                        variant={
                          v.status === 'aplicada' || v.data
                            ? 'success'
                            : 'warning'
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Seção Pesagens */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Pesagens
        </h2>
        {pesagens.length === 0 ? (
          <p className="text-sm text-text-muted">
            Nenhuma pesagem registrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Animal
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Peso (kg)
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Data
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-text-muted">
                    Observações
                  </th>
                </tr>
              </thead>
              <tbody>
                {pesagens.map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    className="border-b border-bg-border/50 hover:bg-bg-elevated/30"
                  >
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {p.animalBrinco || p.animal_id || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {p.peso || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {p.data || '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {p.observacoes || p.observacao || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Seção Alertas */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
          Alertas Ativos
        </h2>
        {alertas.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm text-text-muted">
              Nenhum alerta ativo. Tudo em ordem!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 rounded-lg border ${
                  alerta.tipo === 'critico'
                    ? 'bg-red-900/20 border-red-600/30'
                    : 'bg-yellow-900/20 border-yellow-600/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">
                    {alerta.tipo === 'critico' ? '🔴' : '🟡'}
                  </span>
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-sm ${
                        alerta.tipo === 'critico'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {alerta.titulo}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {alerta.descricao}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
