'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ESPECIE_OPTIONS, getEspecieConfig, categoriaPadrao, type Especie } from '@/lib/especies';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import type { Animal, Sexo } from '@/types';

const formInicial = {
  brinco: '',
  nome: '',
  raca: '',
  sexo: 'M' as Sexo,
  data_nascimento: '',
  categoria: categoriaPadrao('bovino'),
  especie: 'bovino' as Especie,
  lote: '',
  pasto: '',
  peso_atual: '',
};

export default function AnimaisPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const [formData, setFormData] = useState(formInicial);

  // Painel dinâmico: tudo o que muda de acordo com a espécie escolhida vem
  // deste objeto (rótulos, categorias disponíveis, se o nome é obrigatório).
  const especieConfig = getEspecieConfig(formData.especie);

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      setLoading(true);

      // Cada usuário só enxerga os animais da própria fazenda: o filtro é
      // garantido pelo RLS do Supabase (fazenda_id ligado ao owner_id do
      // usuário logado), então basta consultar a tabela normalmente.
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnimais((data as Animal[]) || []);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      addToast('Não foi possível carregar os animais. Tente novamente.', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEspecieChange = (novaEspecie: Especie) => {
    setFormData((prev) => ({
      ...prev,
      especie: novaEspecie,
      // A categoria é sempre relativa à espécie, então trocamos para a
      // primeira opção válida da nova espécie ao alternar o seletor.
      categoria: categoriaPadrao(novaEspecie),
    }));
  };

  const handleCriarAnimal = async () => {
    if (!formData.brinco.trim()) {
      addToast('Informe o brinco (identificação) do animal antes de salvar.', 'error', 5000);
      return;
    }

    if (especieConfig.nomeObrigatorio && !formData.nome.trim()) {
      addToast(`Informe o nome do ${especieConfig.label.toLowerCase()} antes de salvar.`, 'error', 5000);
      return;
    }

    setSaving(true);

    try {
      const pesoNumerico = formData.peso_atual ? Number(formData.peso_atual) : undefined;
      const savedAnimal = await saveAnimalToSupabase({
        brinco: formData.brinco.trim(),
        nome: formData.nome.trim() || undefined,
        especie: formData.especie,
        raca: formData.raca.trim(),
        sexo: formData.sexo,
        data_nascimento: formData.data_nascimento,
        categoria: formData.categoria,
        peso_atual: Number.isFinite(pesoNumerico) ? pesoNumerico : undefined,
        lote: formData.lote,
        pasto: formData.pasto,
      });

      // Gera o calendário de vacinação recomendado para a espécie/categoria
      const agendamentos = VaccinationScheduler.generateSchedule({
        id: savedAnimal.id,
        brinco: savedAnimal.brinco,
        sexo: formData.sexo,
        dataNascimento: formData.data_nascimento,
        categoria: formData.categoria,
        especie: formData.especie,
      });

      if (agendamentos.length > 0) {
        const { error: vacError } = await supabase.from('vacinacoes').insert(
          agendamentos.map((item) => ({
            animal_id: savedAnimal.id,
            vacina: item.nome,
            data: item.status === 'aplicada' ? item.dataPrevista : item.dataPrevista,
            dose: item.dose || null,
            veterinario: 'Automático',
            proxima_dose: item.status === 'aplicada' ? null : item.dataPrevista,
          })),
        );
        if (vacError) {
          console.warn('Não foi possível gravar o calendário de vacinação automático:', vacError);
        }
      }

      setAnimais((prev) => [savedAnimal, ...prev]);
      setShowModal(false);
      setFormData(formInicial);
      addToast(`${especieConfig.label} ${savedAnimal.brinco} cadastrado com sucesso.`, 'success', 4000);
      notificarDashboard();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Não foi possível salvar o animal.';
      addToast(message, 'error', 6000);
      console.error('Erro salvando animal no banco:', e);
    } finally {
      setSaving(false);
    }
  };

  // Categorias exibidas no filtro dependem da espécie selecionada no filtro
  const categoriasFiltro = useMemo(() => {
    if (!filtroEspecie) {
      // sem espécie selecionada: mostra a união de todas as categorias
      const todas = new Map<string, string>();
      ESPECIE_OPTIONS.forEach(({ value }) => {
        getEspecieConfig(value).categorias.forEach((c) => todas.set(c.value, c.label));
      });
      return Array.from(todas, ([value, label]) => ({ value, label }));
    }
    return getEspecieConfig(filtroEspecie).categorias;
  }, [filtroEspecie]);

  const animaisFiltrados = animais.filter((animal) => {
    const termo = search.toLowerCase().trim();
    const matchSearch =
      !termo ||
      animal.brinco?.toLowerCase().includes(termo) ||
      animal.nome?.toLowerCase().includes(termo) ||
      animal.raca?.toLowerCase().includes(termo);
    const matchEspecie = filtroEspecie === '' || animal.especie === filtroEspecie;
    const matchCategoria = filtroCategoria === '' || animal.categoria === filtroCategoria;
    return matchSearch && matchEspecie && matchCategoria;
  });

  if (loading) {
    return <LoadingState message="Carregando animais..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Animais"
        description="Gerencie todos os animais da fazenda, de qualquer espécie"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Novo Animal
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Buscar por nome, brinco ou raça"
            placeholder="Ex: Trovão, 001, Nelore"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Espécie
            </label>
            <select
              value={filtroEspecie}
              onChange={(e) => {
                setFiltroEspecie(e.target.value);
                setFiltroCategoria('');
              }}
              className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary focus:ring-2 focus:ring-brand-DEFAULT focus:border-brand-DEFAULT"
            >
              <option value="">Todas</option>
              {ESPECIE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
          </div>
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
              {categoriasFiltro.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      {animaisFiltrados.length === 0 ? (
        <EmptyState
          icon="🐄"
          title={search || filtroCategoria || filtroEspecie ? 'Nenhum animal encontrado' : 'Nenhum animal cadastrado'}
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
                key: 'especie',
                label: 'Espécie',
                render: (value) => {
                  const cfg = getEspecieConfig(value as string);
                  return (
                    <span className="text-sm text-text-secondary">
                      {cfg.emoji} {cfg.label}
                    </span>
                  );
                },
              },
              {
                key: 'nome',
                label: 'Nome',
                render: (value) => (
                  <span className="font-semibold text-text-primary">{value || '-'}</span>
                ),
              },
              {
                key: 'brinco',
                label: 'Brinco / ID',
                render: (value) => (
                  <span className="text-text-secondary">{value}</span>
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
                render: (value, row) => {
                  const cfg = getEspecieConfig(row.especie);
                  const label = cfg.categorias.find((c) => c.value === value)?.label || value || 'N/A';
                  return <Badge label={label} variant="info" />;
                },
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
        title={`Novo ${especieConfig.label}`}
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
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Espécie
            </label>
            <select
              value={formData.especie}
              onChange={(e) => handleEspecieChange(e.target.value as Especie)}
              className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary focus:ring-2 focus:ring-brand-DEFAULT focus:border-brand-DEFAULT"
            >
              {ESPECIE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-muted mt-1">
              O restante do formulário se ajusta automaticamente para {especieConfig.labelPlural.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={especieConfig.identificadorLabel}
              placeholder={especieConfig.identificadorPlaceholder}
              value={formData.brinco}
              onChange={(e) => setFormData({ ...formData, brinco: e.target.value })}
            />
            <Input
              label={`Nome${especieConfig.nomeObrigatorio ? '' : ' (opcional)'}`}
              placeholder={especieConfig.nomePlaceholder}
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>
          {especieConfig.nomeObrigatorio && (
            <p className="text-xs text-text-muted -mt-2">
              Com o nome preenchido, você poderá localizar este {especieConfig.label.toLowerCase()} diretamente pelo nome na busca.
            </p>
          )}

          <Input
            label="Raça"
            placeholder="Ex: Nelore, Angus, Mangalarga"
            value={formData.raca}
            onChange={(e) => setFormData({ ...formData, raca: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Sexo
              </label>
              <select
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value as Sexo })}
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
              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2 border border-bg-border rounded-lg bg-bg-elevated text-text-primary"
              >
                {especieConfig.categorias.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Peso (kg)"
              type="number"
              placeholder="Ex: 250"
              value={formData.peso_atual}
              onChange={(e) => setFormData({ ...formData, peso_atual: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lote"
              placeholder="Ex: Lote A"
              value={formData.lote}
              onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
            />
            <Input
              label="Pasto"
              placeholder="Ex: Pasto 1"
              value={formData.pasto}
              onChange={(e) => setFormData({ ...formData, pasto: e.target.value })}
            />
          </div>
        </div>
      </Modal>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
