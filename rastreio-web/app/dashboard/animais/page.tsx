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
import type { Animal, Categoria, Sexo } from '@/types';

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    brinco: '',
    raca: '',
    sexo: 'M' as Sexo,
    data_nascimento: '',
    categoria: 'bezerro' as Categoria,
    lote: '',
    pasto: '',
    peso_atual: '',
  });

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimais(data || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarAnimal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Aqui você precisaria buscar a fazenda_id do usuário
      const { error } = await supabase.from('animais').insert([
        {
          ...formData,
          fazenda_id: session.user.id, // Isso deveria ser a fazenda_id real
          peso_atual: formData.peso_atual ? parseFloat(formData.peso_atual) : null,
          ativo: true,
        },
      ]);

      if (error) throw error;

      setShowModal(false);
      setFormData({
        brinco: '',
        raca: '',
        sexo: 'M',
        data_nascimento: '',
        categoria: 'bezerro',
        lote: '',
        pasto: '',
        peso_atual: '',
      });
      carregarAnimais();
    } catch (error) {
      console.error('Erro ao criar animal:', error);
    }
  };

  const animaisFiltrados = animais.filter((animal) => {
    const matchSearch =
      animal.brinco.toLowerCase().includes(search.toLowerCase()) ||
      animal.raca?.toLowerCase().includes(search.toLowerCase());
    const matchCategoria =
      filtroCategoria === '' || animal.categoria === filtroCategoria;
    return matchSearch && matchCategoria;
  });

  if (loading) {
    return <LoadingState message="Carregando animais..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Animais"
        description="Gerencie todos os animais da fazenda"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Novo Animal
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar por brinco ou raça"
            placeholder="Ex: 001, Nelore"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Categoria
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary focus:ring-2 focus:ring-brand-DEFAULT focus:border-brand-DEFAULT"
            >
              <option value="">Todas</option>
              <option value="bezerro">Bezerro</option>
              <option value="novilha">Novilha</option>
              <option value="vaca">Vaca</option>
              <option value="touro">Touro</option>
              <option value="boi">Boi</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      {animaisFiltrados.length === 0 ? (
        <EmptyState
          icon="🐄"
          title={search || filtroCategoria ? 'Nenhum animal encontrado' : 'Nenhum animal cadastrado'}
          description="Comece cadastrando seu primeiro animal"
          action={{
            label: '+ Novo Animal',
            onClick: () => setShowModal(true),
          }}
        />
      ) : (
        <Card className="p-6 overflow-x-auto">
          <Table<Animal>
            data={animaisFiltrados}
            keyExtractor={(animal) => animal.id}
            columns={[
              {
                key: 'brinco',
                label: 'Brinco',
                render: (value) => (
                  <span className="font-semibold text-text-primary">{value}</span>
                ),
              },
              {
                key: 'raca',
                label: 'Raça',
                render: (value) => value || '-',
              },
              {
                key: 'categoria',
                label: 'Categoria',
                render: (value) => (
                  <Badge
                    label={value || 'N/A'}
                    variant={
                      value === 'vaca'
                        ? 'success'
                        : value === 'touro'
                          ? 'warning'
                          : 'info'
                    }
                  />
                ),
              },
              {
                key: 'peso_atual',
                label: 'Peso',
                render: (value) => (value ? `${value} kg` : '-'),
              },
              {
                key: 'lote',
                label: 'Lote',
                render: (value) => value || '-',
              },
              {
                key: 'ativo',
                label: 'Status',
                render: (value) => (
                  <Badge
                    label={value ? 'Ativo' : 'Inativo'}
                    variant={value ? 'success' : 'danger'}
                  />
                ),
              },
            ]}
            onRowClick={(animal) => {
              window.location.href = `/dashboard/animais/${animal.id}`;
            }}
          />
        </Card>
      )}

      {/* Modal de Novo Animal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Novo Animal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCriarAnimal}>
              Criar Animal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Brinco *"
            placeholder="Ex: 001"
            value={formData.brinco}
            onChange={(e) =>
              setFormData({ ...formData, brinco: e.target.value })
            }
            required
          />
          <Input
            label="Raça"
            placeholder="Ex: Nelore, Angus"
            value={formData.raca}
            onChange={(e) =>
              setFormData({ ...formData, raca: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sexo
              </label>
              <select
                value={formData.sexo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sexo: e.target.value as Sexo,
                  })
                }
                className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary"
              >
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
              </select>
            </div>
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data_nascimento: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoria: e.target.value as Categoria,
                  })
                }
                className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary"
              >
                <option value="bezerro">Bezerro</option>
                <option value="novilha">Novilha</option>
                <option value="vaca">Vaca</option>
                <option value="touro">Touro</option>
                <option value="boi">Boi</option>
              </select>
            </div>
            <Input
              label="Peso (kg)"
              type="number"
              placeholder="Ex: 250"
              value={formData.peso_atual}
              onChange={(e) =>
                setFormData({ ...formData, peso_atual: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lote"
              placeholder="Ex: Lote A"
              value={formData.lote}
              onChange={(e) =>
                setFormData({ ...formData, lote: e.target.value })
              }
            />
            <Input
              label="Pasto"
              placeholder="Ex: Pasto 1"
              value={formData.pasto}
              onChange={(e) =>
                setFormData({ ...formData, pasto: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
