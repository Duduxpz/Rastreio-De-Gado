'use client';

import { GraficoEvolucao } from '@/components/GraficoEvolucao';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table } from '@/components/ui/Table';
import { supabase } from '@/lib/supabase';
import { notificarDashboard } from '@/lib/notificarDashboard';
import { getEspecieConfig } from '@/lib/especies';
import type { Animal, Pesagem, Vacinacao } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AnimalDetailPage() {
  const params = useParams();
  const animalId = params.id as string;
  const router = useRouter();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vacinacoes, setVacinacoes] = useState<Vacinacao[]>([]);
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVacModal, setShowVacModal] = useState(false);
  const [showPesModal, setShowPesModal] = useState(false);
  const [vacForm, setVacForm] = useState({
    vacina: '',
    data: '',
    dose: '',
    veterinario: '',
    proxima_dose: '',
  });
  const [pesForm, setPesForm] = useState({
    peso: '',
    data: '',
    observacao: '',
  });

  useEffect(() => {
    carregarDados();
  }, [animalId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Sempre lê direto do Supabase. O RLS garante que cada usuário só
      // enxerga os animais da própria fazenda — não usamos mais localStorage
      // compartilhado aqui, pois ele misturava dados entre contas diferentes
      // no mesmo navegador.
      const { data: animalData, error: animalErr } = await supabase
        .from('animais')
        .select('*')
        .eq('id', animalId)
        .single();

      if (animalErr) throw animalErr;
      setAnimal(animalData);

      const { data: vacData } = await supabase
        .from('vacinacoes')
        .select('*')
        .eq('animal_id', animalId)
        .order('data', { ascending: false });

      setVacinacoes(vacData || []);

      const { data: pesData } = await supabase
        .from('pesagens')
        .select('*')
        .eq('animal_id', animalId)
        .order('data', { ascending: false });

      setPesagens(pesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVacinacao = async () => {
    try {
      const { data, error } = await supabase
        .from('vacinacoes')
        .insert([
          {
            animal_id: animalId,
            vacina: vacForm.vacina,
            data: vacForm.data || null,
            dose: vacForm.dose || null,
            veterinario: vacForm.veterinario || null,
            proxima_dose: vacForm.proxima_dose || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setVacinacoes((prev) => (data ? [data, ...prev] : prev));
      setShowVacModal(false);
      setVacForm({
        vacina: '',
        data: '',
        dose: '',
        veterinario: '',
        proxima_dose: '',
      });
      notificarDashboard();
    } catch (error) {
      console.error('Erro ao adicionar vacinação:', error);
    }
  };

  const handleAddPesagem = async () => {
    try {
      const peso = Number.parseFloat(pesForm.peso);
      if (!Number.isFinite(peso)) {
        throw new Error('Informe um peso válido.');
      }

      const { data, error } = await supabase
        .from('pesagens')
        .insert([
          {
            animal_id: animalId,
            peso,
            data: pesForm.data || null,
            observacao: pesForm.observacao || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('animais')
        .update({ peso_atual: peso })
        .eq('id', animalId);

      setPesagens((prev) => (data ? [data, ...prev] : prev));
      setAnimal((prev) => (prev ? { ...prev, peso_atual: peso } : prev));
      setShowPesModal(false);
      setPesForm({
        peso: '',
        data: '',
        observacao: '',
      });
      notificarDashboard();
    } catch (error) {
      console.error('Erro ao adicionar pesagem:', error);
    }
  };

  if (loading || !animal) {
    return <LoadingState />;
  }

  const ultimaVacinacao = vacinacoes[0];
  const especieConfig = getEspecieConfig(animal.especie);
  const categoriaLabel =
    especieConfig.categorias.find((c) => c.value === animal.categoria)?.label ||
    animal.categoria ||
    'N/A';

  const graficoData = pesagens
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((p) => ({
      data: new Date(p.data).toLocaleDateString('pt-BR'),
      peso: p.peso,
    }))
    .slice(-30);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={animal.nome ? `${animal.nome} · ${animal.brinco}` : `Brinco ${animal.brinco}`}
        description={`${especieConfig.emoji} ${especieConfig.label}${animal.raca ? ` · ${animal.raca}` : ''}`}
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Animais', href: '/dashboard/animais' },
          { label: animal.nome || animal.brinco },
        ]}
      />

      {/* Info Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-2">
            Informações Básicas
          </h3>
          <div className="space-y-3">
            {animal.nome && (
              <div>
                <p className="text-xs text-text-muted">Nome</p>
                <p className="font-semibold text-text-primary">{animal.nome}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted">Espécie</p>
              <p className="font-semibold text-text-primary">
                {especieConfig.emoji} {especieConfig.label}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Raça</p>
              <p className="font-semibold text-text-primary">
                {animal.raca || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Sexo</p>
              <p className="font-semibold text-text-primary">
                {animal.sexo === 'M' ? 'Macho' : 'Fêmea'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Categoria</p>
              <Badge
                label={categoriaLabel}
                variant="info"
              />
            </div>
            <div>
              <p className="text-xs text-text-muted">Última vacina</p>
              <p className="font-semibold text-text-primary">
                {ultimaVacinacao?.vacina || 'Nenhuma registrada'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Aplicação</p>
              <p className="font-semibold text-text-primary">
                {ultimaVacinacao?.data
                  ? new Date(ultimaVacinacao.data).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Status</p>
              <Badge
                label={animal.ativo ? 'Ativo' : 'Inativo'}
                variant={animal.ativo ? 'success' : 'danger'}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-2">
            Localização
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-muted">Lote</p>
              <p className="font-semibold text-text-primary">
                {animal.lote || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Pasto</p>
              <p className="font-semibold text-text-primary">
                {animal.pasto || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Data de Nascimento</p>
              <p className="font-semibold text-text-primary">
                {animal.data_nascimento
                  ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR')
                  : '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-2">
            Peso
          </h3>
          <p className="text-4xl font-bold text-brand-light mb-2">
            {animal.peso_atual || '?'} kg
          </p>
          <p className="text-xs text-text-muted">Última pesagem registrada</p>
          {pesagens.length > 0 && (
            <p className="text-xs text-text-muted mt-2">
              {new Date(pesagens[0].data).toLocaleDateString('pt-BR')}
            </p>
          )}
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      {graficoData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            📈 Evolução de Peso
          </h3>
          <GraficoEvolucao dados={graficoData} />
        </Card>
      )}

      {/* Vacinações */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            💉 Vacinações
          </h3>
          <Button
            variant="primary"
            onClick={() => setShowVacModal(true)}
          >
            + Adicionar
          </Button>
        </div>

        {vacinacoes.length === 0 ? (
          <p className="text-text-muted text-center py-4">
            Nenhuma vacinação registrada
          </p>
        ) : (
          <Table<Vacinacao>
            data={vacinacoes}
            keyExtractor={(v) => v.id}
            columns={[
              {
                key: 'vacina',
                label: 'Vacina',
                render: (value) => (
                  <span className="font-semibold text-text-primary">{value}</span>
                ),
              },
              {
                key: 'data',
                label: 'Data',
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
                render: (value) =>
                  value
                    ? new Date(value).toLocaleDateString('pt-BR')
                    : '-',
              },
            ]}
          />
        )}
      </Card>

      {/* Pesagens */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            ⚖️ Pesagens
          </h3>
          <Button
            variant="primary"
            onClick={() => setShowPesModal(true)}
          >
            + Adicionar
          </Button>
        </div>

        {pesagens.length === 0 ? (
          <p className="text-text-muted text-center py-4">
            Nenhuma pesagem registrada
          </p>
        ) : (
          <Table<Pesagem>
            data={pesagens}
            keyExtractor={(p) => p.id}
            columns={[
              {
                key: 'data',
                label: 'Data',
                render: (value) =>
                  new Date(value).toLocaleDateString('pt-BR'),
              },
              {
                key: 'peso',
                label: 'Peso',
                render: (value) => `${value} kg`,
              },
              {
                key: 'observacao',
                label: 'Observação',
                render: (value) => value || '-',
              },
            ]}
          />
        )}
      </Card>

      {/* Modal Vacinação */}
      <Modal
        isOpen={showVacModal}
        onClose={() => setShowVacModal(false)}
        title="Adicionar Vacinação"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowVacModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddVacinacao}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Vacina *"
            placeholder="Ex: Febre Aftosa"
            value={vacForm.vacina}
            onChange={(e) =>
              setVacForm({ ...vacForm, vacina: e.target.value })
            }
          />
          <Input
            label="Data *"
            type="date"
            value={vacForm.data}
            onChange={(e) =>
              setVacForm({ ...vacForm, data: e.target.value })
            }
          />
          <Input
            label="Dose"
            placeholder="Ex: 1ª dose"
            value={vacForm.dose}
            onChange={(e) =>
              setVacForm({ ...vacForm, dose: e.target.value })
            }
          />
          <Input
            label="Veterinário"
            placeholder="Nome do veterinário"
            value={vacForm.veterinario}
            onChange={(e) =>
              setVacForm({ ...vacForm, veterinario: e.target.value })
            }
          />
          <Input
            label="Próxima Dose"
            type="date"
            value={vacForm.proxima_dose}
            onChange={(e) =>
              setVacForm({ ...vacForm, proxima_dose: e.target.value })
            }
          />
        </div>
      </Modal>

      {/* Modal Pesagem */}
      <Modal
        isOpen={showPesModal}
        onClose={() => setShowPesModal(false)}
        title="Adicionar Pesagem"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPesModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddPesagem}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Data *"
            type="date"
            value={pesForm.data}
            onChange={(e) =>
              setPesForm({ ...pesForm, data: e.target.value })
            }
          />
          <Input
            label="Peso (kg) *"
            type="number"
            placeholder="Ex: 250"
            value={pesForm.peso}
            onChange={(e) =>
              setPesForm({ ...pesForm, peso: e.target.value })
            }
          />
          <Input
            label="Observação"
            placeholder="Alguma observação sobre a pesagem?"
            value={pesForm.observacao}
            onChange={(e) =>
              setPesForm({ ...pesForm, observacao: e.target.value })
            }
          />
        </div>
      </Modal>
      <button
        onClick={() => router.push('/dashboard/animais')}
        className="text-white opacity-80 hover:opacity-100 mb-4 flex items-center gap-2"
      >
        ← Voltar
      </button>

      <div className="mt-6">
        <Button variant="primary" onClick={() => { /* placeholder for edit */ }}>
          Editar Animal
        </Button>
      </div>
    </div>
  );
}
