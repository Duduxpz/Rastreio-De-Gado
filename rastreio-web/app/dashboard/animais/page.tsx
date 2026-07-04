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
import { animalSpeciesOptions, getAnimalCategoryLabel, getAnimalSpeciesLabel } from '@/lib/animal-species';
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
    especie: 'bovino' as 'bovino' | 'equino' | 'ovino' | 'caprino' | 'suino' | 'ave' | 'outro',
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

      const stored = globalThis.localStorage?.getItem('animais');
      if (stored) {
        const locais = JSON.parse(stored || '[]');
        const mapped = locais.map((a: any) => ({
          id: a.id,
          fazenda_id: a.fazenda_id || '',
          brinco: a.brinco || '',
          raca: a.raca || '',
          sexo: a.sexo === 'Macho' ? 'M' : a.sexo === 'Fêmea' ? 'F' : (a.sexo || ''),
          data_nascimento: a.dataNascimento || a.data_nascimento || '',
          peso_atual: a.peso ? (Number.isNaN(Number(a.peso)) ? undefined : Number(a.peso)) : (a.peso_atual || undefined),
          lote: a.lote || '',
          pasto: a.pasto || '',
          categoria: (a.categoria || '').toLowerCase(),
          especie: a.especie || 'bovino',
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
    const novoAnimal = {
      id: Date.now().toString(),
      brinco: formData.brinco || '',
      raca: formData.raca || '',
      sexo: formData.sexo === 'M' ? 'Macho' : 'Fêmea',
      dataNascimento: formData.data_nascimento || '',
      categoria: getAnimalCategoryLabel(formData.especie, formData.categoria),
      especie: formData.especie,
      peso: formData.peso_atual || '',
      lote: formData.lote || '',
      pasto: formData.pasto || '',
      criadoEm: new Date().toISOString(),
    };

    try {
      const pesoNumerico = novoAnimal.peso ? Number(novoAnimal.peso) : undefined;
      const savedAnimal = await saveAnimalToSupabase({
        id: novoAnimal.id,
        brinco: novoAnimal.brinco,
        raca: novoAnimal.raca,
        sexo: formData.sexo,
        data_nascimento: novoAnimal.dataNascimento,
        categoria: formData.categoria,
        especie: formData.especie,
        peso_atual: Number.isFinite(pesoNumerico) ? pesoNumerico : undefined,
        lote: novoAnimal.lote,
        pasto: novoAnimal.pasto,
      });

      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        const existentes = JSON.parse(globalThis.localStorage.getItem('animais') || '[]');
        globalThis.localStorage.setItem('animais', JSON.stringify([...existentes, novoAnimal]));

        const agendamentos = VaccinationScheduler.generateSchedule({
          id: novoAnimal.id,
          brinco: novoAnimal.brinco,
          sexo: formData.sexo,
          dataNascimento: novoAnimal.dataNascimento,
          categoria: formData.categoria,
          especie: formData.especie,
        });

        const vacinacoesExistentes = JSON.parse(globalThis.localStorage.getItem('vacinacoes') || '[]');
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
        globalThis.localStorage.setItem('vacinacoes', JSON.stringify(vacinacoesAtualizadas));
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
        especie: savedAnimal.especie || formData.especie,
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
      notificarDashboard();
    } catch (e) {
      console.error('Erro salvando animal no banco:', e);
    }
  };

  const animaisFiltrados = animais.filter((animal) => {
    const matchSearch =
      animal.brinco.toLowerCase().includes(search.toLowerCase()) ||
      animal.raca?.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = filtroCategoria === '' || animal.categoria === filtroCategoria || animal.especie === filtroCategoria;
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
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Buscar por brinco ou raça"
            placeholder="Ex: 001, Nelore"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div>
            <label htmlFor="species-filter" className="mb-2 block text-sm font-medium text-text-secondary">
              Espécie / Categoria
            </label>
            <select
              id="species-filter"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-text-primary focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-DEFAULT"
            >
              <option value="">Todas</option>
              {animalSpeciesOptions.map((option) => (
                <optgroup key={option.value} label={option.label}>
                  {option.categories.map((category) => (
                    <option key={`${option.value}-${category.value}`} value={category.value}>
                      {option.label} · {category.label}
                    </option>
                  ))}
                </optgroup>
              ))}
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
        <Card className="overflow-x-auto p-4 sm:p-6">
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
                key: 'especie',
                label: 'Espécie',
                render: (value, row) => (
                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">{getAnimalSpeciesLabel(String(value || row.especie || 'bovino'))}</p>
                    <p className="text-xs text-text-muted">{getAnimalCategoryLabel(String(row.especie || 'bovino'), row.categoria)}</p>
                  </div>
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
              globalThis.window.location.href = `/dashboard/animais/${animal.id}`;
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
            <Button variant="primary" onClick={handleCriarAnimal} type="button">
              Criar Animal
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="animal-species" className="mb-2 block text-sm font-medium text-text-secondary">
                Espécie
              </label>
              <select
                id="animal-species"
                value={formData.especie}
                onChange={(e) => {
                  const nextEspecie = e.target.value as typeof formData.especie;
                  const nextSpeciesMeta = animalSpeciesOptions.find((option) => option.value === nextEspecie);
                  const fallbackCategory = nextSpeciesMeta?.categories[0]?.value || 'outro';
                  setFormData({ ...formData, especie: nextEspecie, categoria: fallbackCategory as Categoria });
                }}
                className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2 text-text-primary focus:border-brand-DEFAULT focus:ring-2 focus:ring-brand-DEFAULT"
              >
                {animalSpeciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="animal-sex" className="mb-2 block text-sm font-medium text-text-secondary">
                Sexo
              </label>
              <select
                id="animal-sex"
                value={formData.sexo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sexo: e.target.value as Sexo,
                  })
                }
                className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2 text-text-primary"
              >
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
              </select>
            </div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="animal-category" className="mb-2 block text-sm font-medium text-text-secondary">
                Categoria
              </label>
              <select
                id="animal-category"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoria: e.target.value as Categoria,
                  })
                }
                className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2 text-text-primary"
              >
                {animalSpeciesOptions
                  .find((option) => option.value === formData.especie)
                  ?.categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
