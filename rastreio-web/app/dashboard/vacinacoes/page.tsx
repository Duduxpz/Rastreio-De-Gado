'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { Vacinacao, Animal } from '@/types';

interface VacinacaoComAnimal extends Vacinacao {
  animal?: Animal;
}

export default function VacinacoesPag() {
  const [vacinacoes, setVacinacoes] = useState<VacinacaoComAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [form, setForm] = useState({
    animal_id: '',
    vacina: '',
    data: '',
    dose: '',
    veterinario: '',
    proxima_dose: '',
  });
  const [animaisOpcoes, setAnimaisOpcoes] = useState<Animal[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data: vacData } = await supabase
        .from('vacinacoes')
        .select('*')
        .order('data', { ascending: false });

      // Carregar informações dos animais
      const { data: animaisData } = await supabase
        .from('animais')
        .select('*');

      setAnimaisOpcoes(animaisData || []);

      const vacinacoesMapped = (vacData || []).map((vac) => ({
        ...vac,
        animal: animaisData?.find((a) => a.id === vac.animal_id),
      }));

      setVacinacoes(vacinacoesMapped);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      const { error } = await supabase.from('vacinacoes').insert([form]);
      if (error) throw error;

      setShowModal(false);
      setForm({
        animal_id: '',
        vacina: '',
        data: '',
        dose: '',
        veterinario: '',
        proxima_dose: '',
      });
      carregarDados();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const vacinacoesFiltrads = vacinacoes.filter((v) => {
    const matchSearch =
      v.vacina.toLowerCase().includes(search.toLowerCase()) ||
      v.animal?.brinco.toLowerCase().includes(search.toLowerCase());

    const hoje = new Date().toISOString().split('T')[0];
    let matchStatus = true;
    if (filtroStatus === 'pendente') {
      matchStatus = v.proxima_dose && v.proxima_dose <= hoje;
    } else if (filtroStatus === 'realizado') {
      matchStatus = v.proxima_dose && v.proxima_dose > hoje;
    }

    return matchSearch && matchStatus;
  });

  if (loading) {
    return <LoadingState message="Carregando vacinações..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacinações"
        description="Controle de todas as vacinações dos animais"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Nova Vacinação
          </Button>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar"
            placeholder="Vacina ou brinco do animal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="realizado">Realizado</option>
            </select>
          </div>
        </div>
      </Card>

      {vacinacoesFiltrads.length === 0 ? (
        <EmptyState
          icon="💉"
          title="Nenhuma vacinação encontrada"
          action={{
            label: '+ Nova Vacinação',
            onClick: () => setShowModal(true),
          }}
        />
      ) : (
        <Card className="overflow-x-auto">
          <Table<VacinacaoComAnimal>
            data={vacinacoesFiltrads}
            keyExtractor={(v) => v.id}
            columns={[
              {
                key: 'animal',
                label: 'Animal',
                render: (_, row) =>
                  row.animal ? (
                    <span className="font-semibold text-text-primary">
                      Brinco {row.animal.brinco}
                    </span>
                  ) : (
                    '-'
                  ),
              },
              {
                key: 'vacina',
                label: 'Vacina',
                render: (value) => (
                  <span className="font-semibold text-text-primary">{value}</span>
                ),
              },
              {
                key: 'data',
                label: 'Data Aplicação',
                render: (value) =>
                  new Date(value).toLocaleDateString('pt-BR'),
              },
              {
                key: 'dose',
                label: 'Dose',
                render: (value) => value || '-',
              },
              {
                key: 'veterinario',
                label: 'Veterinário',
                render: (value) => value || '-',
              },
              {
                key: 'proxima_dose',
                label: 'Próxima Dose',
                render: (value) => {
                  if (!value) return '-';
                  const hoje = new Date().toISOString().split('T')[0];
                  const isPendente = value <= hoje;
                  return (
                    <>
                      <div>
                        {new Date(value).toLocaleDateString('pt-BR')}
                      </div>
                      {isPendente && (
                        <Badge label="Pendente" variant="warning" />
                      )}
                    </>
                  );
                },
              },
            ]}
          />
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Vacinação"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSalvar}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Animal *
            </label>
            <select
              value={form.animal_id}
              onChange={(e) =>
                setForm({ ...form, animal_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary"
            >
              <option value="">Selecione um animal</option>
              {animaisOpcoes.map((a) => (
                <option key={a.id} value={a.id}>
                  Brinco {a.brinco} - {a.raca}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Vacina *"
            value={form.vacina}
            onChange={(e) =>
              setForm({ ...form, vacina: e.target.value })
            }
          />
          <Input
            label="Data *"
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
          <Input
            label="Dose"
            value={form.dose}
            onChange={(e) => setForm({ ...form, dose: e.target.value })}
          />
          <Input
            label="Veterinário"
            value={form.veterinario}
            onChange={(e) =>
              setForm({ ...form, veterinario: e.target.value })
            }
          />
          <Input
            label="Próxima Dose"
            type="date"
            value={form.proxima_dose}
            onChange={(e) =>
              setForm({ ...form, proxima_dose: e.target.value })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
