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
import { notificarDashboard } from '@/lib/notificarDashboard';
import { VaccinationScheduler } from '@/lib/vaccination-scheduler';
import { saveAnimalToSupabase } from '@/lib/fazenda';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type { Animal, Categoria, Sexo } from '@/types';

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [formData, setFormData] = useState({
    brinco: '',
    raca: '',
    sexo: 'M' as Sexo,
    data_nascimento: '',
    categoria: 'bezerro' as Categoria,
    especie: 'bovino' as 'bovino' | 'equino' | 'ovino' | 'caprino' | 'suino' | 'ave',
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

      if (data && data.length > 0) {
        setAnimais(data as Animal[]);
        return;
      }

      const stored = typeof window !== 'undefined' ? localStorage.getItem('animais') : null;
      if (stored) {
        const locais = JSON.parse(stored || '[]');
        const mapped = locais.map((a: any) => ({
          id: a.id,
          fazenda_id: a.fazenda_id || '',
          brinco: a.brinco || '',
          raca: a.raca || '',
          sexo: a.sexo === 'Macho' ? 'M' : a.sexo === 'Fêmea' ? 'F' : (a.sexo || ''),
          data_nascimento: a.dataNascimento || a.data_nascimento || '',
          peso_atual: a.peso ? (isNaN(Number(a.peso)) ? undefined : Number(a.peso)) : (a.peso_atual || undefined),
          lote: a.lote || '',
          pasto: a.pasto || '',
          categoria: (a.categoria || '').toLowerCase(),
          foto_url: a.foto_url || null,
          ativo: typeof a.ativo === 'boolean' ? a.ativo : true,
          created_at: a.criadoEm || a.created_at || new Date().toISOString(),
          updated_at: a.updated_at || new Date().toISOString(),
        }));
        setAnimais(mapped || []);
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarAnimal = async () => {
    if (!formData.brinco.trim()) {
      addToast('Informe o brinco do animal antes de salvar.', 'error', 5000);
      return;
    }

    const novoAnimal = {
      id: Date.now().toString(),
      brinco: formData.brinco.trim(),
      raca: formData.raca.trim(),
      sexo: formData.sexo === 'M' ? 'Macho' : formData.sexo === 'F' ? 'Fêmea' : (formData.sexo || ''),
      dataNascimento: formData.data_nascimento || '',
      categoria:
        formData.categoria === 'bezerro'
          ? 'Bezerro'
          : formData.categoria === 'novilha'
          ? 'Novilha'
          : formData.categoria === 'vaca'
          ? 'Vaca'
          : formData.categoria === 'touro'
          ? 'Touro'
          : formData.categoria === 'boi'
          ? 'Boi'
          : formData.categoria || '',
      especie: formData.especie,
      peso: formData.peso_atual || '',
      lote: formData.lote || '',
      pasto: formData.pasto || '',
      criadoEm: new Date().toISOString(),
    };

    setSaving(true);

    try {
      const pesoNumerico = novoAnimal.peso ? Number(novoAnimal.peso) : undefined;
      const savedAnimal = await saveAnimalToSupabase({
        id: novoAnimal.id,
        brinco: novoAnimal.brinco,
        raca: novoAnimal.raca,
        sexo: formData.sexo,
        data_nascimento: novoAnimal.dataNascimento,
        categoria: formData.categoria,
        peso_atual: Number.isFinite(pesoNumerico) ? pesoNumerico : undefined,
        lote: novoAnimal.lote,
        pasto: novoAnimal.pasto,
      });

      if (typeof window !== 'undefined') {
        const existentes = JSON.parse(localStorage.getItem('animais') || '[]');
        localStorage.setItem('animais', JSON.stringify([...existentes, novoAnimal]));

        const agendamentos = VaccinationScheduler.generateSchedule({
          id: novoAnimal.id,
          brinco: novoAnimal.brinco,
          sexo: formData.sexo,
          dataNascimento: novoAnimal.dataNascimento,
          categoria: formData.categoria,
          especie: formData.especie,
        });

        const vacinacoesExistentes = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
        const vacinacoesAtualizadas = [
          ...vacinacoesExistentes,
          ...agendamentos.map((item) => ({
            id: item.id,
            animalId: item.animalId,
            animalBrinco: item.animalBrinco,
            vacina: item.nome,
            lote: '',
            dataAplicacao: item.status === 'aplicada' ? item.dataPrevista : '',
            dataVencimento: item.dataPrevista,
            responsavel: 'Automático',
            observacoes: item.observacao || item.dose,
            status: item.status === 'aplicada' ? 'aplicada' : 'pendente',
            criadoEm: new Date().toISOString(),
          })),
        ];
        localStorage.setItem('vacinacoes', JSON.stringify(vacinacoesAtualizadas));
      }

      const mappedAnimal = {
        id: savedAnimal.id,
        fazenda_id: savedAnimal.fazenda_id || '',
        brinco: savedAnimal.brinco || '',
        raca: savedAnimal.raca || '',
        sexo: savedAnimal.sexo === 'M' || savedAnimal.sexo === 'F' ? savedAnimal.sexo : '',
        data_nascimento: savedAnimal.data_nascimento || '',
        peso_atual: savedAnimal.peso_atual ? Number(savedAnimal.peso_atual) : undefined,
        lote: savedAnimal.lote || '',
        pasto: savedAnimal.pasto || '',
        categoria: (savedAnimal.categoria || '').toLowerCase(),
        foto_url: savedAnimal.foto_url || null,
        ativo: savedAnimal.ativo ?? true,
        created_at: savedAnimal.created_at || new Date().toISOString(),
        updated_at: savedAnimal.updated_at || new Date().toISOString(),
      } as Animal;

      setAnimais((prev) => [mappedAnimal, ...prev]);
      setShowModal(false);
      setFormData({
        brinco: '',
        raca: '',
        sexo: 'M',
        data_nascimento: '',
        categoria: 'bezerro',
        especie: 'bovino',
        lote: '',
        pasto: '',
        peso_atual: '',
      });
      addToast(`Animal ${novoAnimal.brinco} cadastrado com sucesso.`, 'success', 4000);
      notificarDashboard();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Não foi possível salvar o animal.';
      addToast(message, 'error', 6000);
      console.error('Erro salvando animal no banco:', e);
    } finally {
      setSaving(false);
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
            <Button variant="primary" onClick={handleCriarAnimal} type="button" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar Animal'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Brinco"
            placeholder="Ex: 001"
            value={formData.brinco}
            onChange={(e) =>
              setFormData({ ...formData, brinco: e.target.value })
            }
          />
          <Input
            label="Raça"
            placeholder="Ex: Nelore, Angus"
            value={formData.raca}
            onChange={(e) =>
              setFormData({ ...formData, raca: e.target.value })
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Espécie
              </label>
              <select
                value={formData.especie}
                onChange={(e) =>
                  setFormData({ ...formData, especie: e.target.value as typeof formData.especie })
                }
                className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary focus:ring-2 focus:ring-brand-DEFAULT focus:border-brand-DEFAULT"
              >
                <option value="bovino">Bovino</option>
                <option value="equino">Equino</option>
                <option value="ovino">Ovino</option>
                <option value="caprino">Caprino</option>
                <option value="suino">Suíno</option>
                <option value="ave">Ave</option>
              </select>
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
