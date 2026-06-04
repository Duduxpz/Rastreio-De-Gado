'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { Pesagem, Animal } from '@/types';

interface PesagemComAnimal extends Pesagem {
  animal?: Animal;
}

export default function PesagensPage() {
  const [pesagens, setPesagens] = useState<PesagemComAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    animal_id: '',
    peso: '',
    data: '',
    observacao: '',
  });
  const [animaisOpcoes, setAnimaisOpcoes] = useState<Animal[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data: pesData } = await supabase
        .from('pesagens')
        .select('*')
        .order('data', { ascending: false });

      const { data: animaisData } = await supabase
        .from('animais')
        .select('*');

      setAnimaisOpcoes(animaisData || []);

      const pesagensMapped = (pesData || []).map((p) => ({
        ...p,
        animal: animaisData?.find((a) => a.id === p.animal_id),
      }));

      setPesagens(pesagensMapped);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      const { error } = await supabase.from('pesagens').insert([
        {
          ...form,
          peso: parseFloat(form.peso),
        },
      ]);
      if (error) throw error;

      setShowModal(false);
      setForm({
        animal_id: '',
        peso: '',
        data: '',
        observacao: '',
      });
      carregarDados();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const pesagensFiltrads = pesagens.filter((p) => {
    return (
      p.animal?.brinco.toLowerCase().includes(search.toLowerCase()) ||
      p.animal?.raca?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return <LoadingState message="Carregando pesagens..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pesagens"
        description="Registro de todas as pesagens dos animais"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Nova Pesagem
          </Button>
        }
      />

      <Card className="p-6">
        <Input
          label="Buscar"
          placeholder="Brinco ou raça do animal"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {pesagensFiltrads.length === 0 ? (
        <EmptyState
          icon="⚖️"
          title="Nenhuma pesagem encontrada"
          action={{
            label: '+ Nova Pesagem',
            onClick: () => setShowModal(true),
          }}
        />
      ) : (
        <Card className="overflow-x-auto">
          <Table<PesagemComAnimal>
            data={pesagensFiltrads}
            keyExtractor={(p) => p.id}
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
                key: 'data',
                label: 'Data',
                render: (value) =>
                  new Date(value).toLocaleDateString('pt-BR'),
              },
              {
                key: 'peso',
                label: 'Peso',
                render: (value) => (
                  <span className="font-semibold text-text-primary">
                    {value} kg
                  </span>
                ),
              },
              {
                key: 'observacao',
                label: 'Observação',
                render: (value) => value || '-',
              },
            ]}
          />
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Pesagem"
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
            label="Data *"
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
          <Input
            label="Peso (kg) *"
            type="number"
            step="0.1"
            value={form.peso}
            onChange={(e) => setForm({ ...form, peso: e.target.value })}
          />
          <Input
            label="Observação"
            value={form.observacao}
            onChange={(e) =>
              setForm({ ...form, observacao: e.target.value })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
