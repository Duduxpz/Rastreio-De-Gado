'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { notificarDashboard } from '@/lib/notificarDashboard';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CalendarClock, CheckCircle2, Clock3, Syringe } from 'lucide-react';

interface VacinacaoLocal {
  id: string;
  animalId: string;
  animalBrinco: string;
  vacina: string;
  lote: string;
  dataAplicacao: string;
  dataVencimento: string;
  responsavel: string;
  observacoes: string;
  status: 'pendente' | 'aplicada';
  criadoEm: string;
}

export default function VacinacoesPag() {
  const router = useRouter();
  const [vacinacoes, setVacinacoes] = useState<VacinacaoLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    void carregarVacinacoes();
  }, []);

  const carregarVacinacoes = async () => {
    try {
      setLoading(true);
      const { data: vacinacoesData, error: vacError } = await supabase
        .from('vacinacoes')
        .select('*')
        .order('data', { ascending: false });

      if (vacError) throw vacError;

      const { data: animaisData, error: animalError } = await supabase
        .from('animais')
        .select('*')
        .eq('ativo', true);

      if (animalError) throw animalError;

      const animaisMap = new Map((animaisData || []).map((animal) => [animal.id, animal]));
      const dados = (vacinacoesData || []).map((v) => ({
        id: v.id as string,
        animalId: (v.animal_id as string) || '',
        animalBrinco: (animaisMap.get(v.animal_id as string)?.brinco as string) || '',
        vacina: (v.vacina as string) || '',
        lote: (v.dose as string) || '',
        dataAplicacao: (v.data as string) || '',
        dataVencimento: (v.proxima_dose as string) || '',
        responsavel: (v.veterinario as string) || '',
        observacoes: '',
        status: ((v.data as string) ? 'aplicada' : 'pendente') as 'pendente' | 'aplicada',
        criadoEm: (v.created_at as string) || new Date().toISOString(),
      }));

      setVacinacoes(dados);
    } catch (error) {
      console.error('Erro ao carregar vacinações:', error);
      setVacinacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const vacinacoesFiltradas = vacinacoes.filter((v) => {
    const termo = busca.toLowerCase();
    return (
      v.vacina?.toLowerCase().includes(termo) ||
      v.animalBrinco?.toLowerCase().includes(termo) ||
      v.responsavel?.toLowerCase().includes(termo)
    );
  });

  const pendentes = vacinacoesFiltradas.filter((v) => v.status !== 'aplicada').length;
  const atrasadas = vacinacoesFiltradas.filter((v) => v.status !== 'aplicada' && v.dataVencimento && new Date(v.dataVencimento) < new Date()).length;
  const proximas = vacinacoesFiltradas.filter((v) => v.status !== 'aplicada' && v.dataVencimento).slice(0, 3);

  const handleExcluir = async (id: string) => {
    try {
      await supabase.from('vacinacoes').delete().eq('id', id);
      setVacinacoes((prev) => prev.filter((v) => v.id !== id));
      notificarDashboard();
    } catch (error) {
      console.error('Erro ao excluir vacinação:', error);
    }
  };

  const handleSalvarVacinacao = async (novaVacinacao: VacinacaoLocal) => {
    try {
      const { data, error } = await supabase
        .from('vacinacoes')
        .insert([
          {
            animal_id: novaVacinacao.animalId,
            vacina: novaVacinacao.vacina,
            data: novaVacinacao.dataAplicacao || null,
            dose: novaVacinacao.lote || null,
            veterinario: novaVacinacao.responsavel || null,
            proxima_dose: novaVacinacao.dataVencimento || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setShowModal(false);
      await carregarVacinacoes();
      notificarDashboard();
      if (data) {
        setVacinacoes((prev) => [
          {
            id: data.id as string,
            animalId: data.animal_id as string,
            animalBrinco: novaVacinacao.animalBrinco,
            vacina: data.vacina as string,
            lote: data.dose as string,
            dataAplicacao: data.data as string,
            dataVencimento: data.proxima_dose as string,
            responsavel: data.veterinario as string,
            observacoes: '',
            status: (data.data ? 'aplicada' : 'pendente') as 'pendente' | 'aplicada',
            criadoEm: (data.created_at as string) || new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error('Erro ao salvar vacinação:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando vacinações..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vacinações"
        description="Registros sanitários do rebanho"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Nova Vacinação
          </Button>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Buscar por vacina, animal ou responsável"
            placeholder="Ex: Aftosa, 001, Dr. João"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-brand-DEFAULT/30">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand-subtle p-2"><Clock3 size={18} className="text-brand-light" /></div>
            <div>
              <p className="text-sm text-text-secondary">Pendentes</p>
              <p className="text-2xl font-semibold text-text-primary">{pendentes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-danger-DEFAULT/30">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-danger-subtle p-2"><AlertCircle size={18} className="text-danger-DEFAULT" /></div>
            <div>
              <p className="text-sm text-text-secondary">Atrasadas</p>
              <p className="text-2xl font-semibold text-text-primary">{atrasadas}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-info-DEFAULT/30">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-info-subtle p-2"><CalendarClock size={18} className="text-info-DEFAULT" /></div>
            <div>
              <p className="text-sm text-text-secondary">Próximas</p>
              <p className="text-2xl font-semibold text-text-primary">{proximas.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {proximas.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Próximas aplicações</h2>
            <span className="text-xs text-text-muted">Agendamento automático</span>
          </div>
          <div className="space-y-3">
            {proximas.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-elevated/40 px-4 py-3">
                <div>
                  <p className="font-medium text-text-primary">{v.vacina}</p>
                  <p className="text-sm text-text-secondary">{v.animalBrinco} • {v.dataVencimento || 'Sem data'}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-brand-subtle px-3 py-1 text-xs font-medium text-brand-light">
                  <CheckCircle2 size={14} />
                  Pendente
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {vacinacoesFiltradas.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title={busca ? 'Nenhuma vacinação encontrada' : 'Nenhuma vacinação registrada'}
          description="Comece registrando a primeira vacinação do rebanho"
          action={{
            label: '+ Nova Vacinação',
            onClick: () => setShowModal(true),
          }}
        />
      ) : (
        <Card className="p-6 overflow-x-auto">
          <div className="min-w-full overflow-x-auto">
            <table className="w-full text-sm text-gray-200">
              <thead className="border-b border-gray-600">
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Brinco</th>
                  <th className="text-left py-3 px-4">Vacina</th>
                  <th className="text-left py-3 px-4">Aplicação</th>
                  <th className="text-left py-3 px-4">Vencimento</th>
                  <th className="text-left py-3 px-4">Responsável</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {vacinacoesFiltradas.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => router.push(`/dashboard/vacinacoes/${v.id}`)}
                    className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-medium">{v.animalBrinco || '—'}</td>
                    <td className="py-4 px-4">{v.vacina || '—'}</td>
                    <td className="py-4 px-4">{v.dataAplicacao || '—'}</td>
                    <td className="py-4 px-4">{v.dataVencimento || '—'}</td>
                    <td className="py-4 px-4">{v.responsavel || '—'}</td>
                    <td className="py-4 px-4">
                      <Badge
                        label={v.status === 'aplicada' ? 'Aplicada' : 'Pendente'}
                        variant={v.status === 'aplicada' ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/vacinacoes/${v.id}`);
                          }}
                          className="text-lg hover:opacity-70 transition"
                          title="Ver detalhes"
                        >
                          👁
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleExcluir(v.id);
                          }}
                          className="text-lg hover:opacity-70 transition"
                          title="Excluir"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ModalNovaVacinacao
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSalvar={handleSalvarVacinacao}
      />
    </div>
  );
}

interface ModalNovaVacinacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (vacinacao: VacinacaoLocal) => void;
}

function ModalNovaVacinacao({ isOpen, onClose, onSalvar }: ModalNovaVacinacaoProps) {
  const [form, setForm] = useState({
    animalId: '',
    animalBrinco: '',
    vacina: '',
    lote: '',
    dataAplicacao: '',
    dataVencimento: '',
    responsavel: '',
    observacoes: '',
    status: 'pendente' as 'pendente' | 'aplicada',
  });

  const [animais, setAnimais] = useState<Array<{ id: string; brinco?: string }>>([]);

  useEffect(() => {
    if (!isOpen) return;

    const carregarAnimais = async () => {
      const { data } = await supabase.from('animais').select('*').eq('ativo', true);
      setAnimais((data || []) as Array<{ id: string; brinco?: string }>);
    };

    void carregarAnimais();
  }, [isOpen]);

  const handleSalvar = () => {
    const animal = animais.find((item) => item.id === form.animalId) || animais.find((item) => item.brinco === form.animalBrinco);
    if (!animal) {
      return;
    }

    const novaVacinacao: VacinacaoLocal = {
      id: Date.now().toString(),
      animalId: animal.id,
      animalBrinco: animal.brinco || form.animalBrinco,
      vacina: form.vacina || '',
      lote: form.lote || '',
      dataAplicacao: form.dataAplicacao || '',
      dataVencimento: form.dataVencimento || '',
      responsavel: form.responsavel || '',
      observacoes: form.observacoes || '',
      status: form.status,
      criadoEm: new Date().toISOString(),
    };
    onSalvar(novaVacinacao);
    setForm({
      animalId: '',
      animalBrinco: '',
      vacina: '',
      lote: '',
      dataAplicacao: '',
      dataVencimento: '',
      responsavel: '',
      observacoes: '',
      status: 'pendente',
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Vacinação"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar}>
            Salvar Vacinação
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Animal (Brinco)</label>
          {animais.length > 0 ? (
            <select
              value={form.animalId}
              onChange={(e) => {
                const animal = animais.find((item) => item.id === e.target.value);
                setForm({
                  ...form,
                  animalId: e.target.value,
                  animalBrinco: animal?.brinco || '',
                });
              }}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="">Selecionar animal...</option>
              {animais.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.brinco || `Animal #${animal.id}`}
                </option>
              ))}
            </select>
          ) : (
            <Input
              placeholder="Ex: 001"
              value={form.animalBrinco}
              onChange={(e) => setForm({ ...form, animalBrinco: e.target.value })}
            />
          )}
        </div>

        <Input
          label="Vacina"
          placeholder="Ex: Aftosa, Brucelose"
          value={form.vacina}
          onChange={(e) => setForm({ ...form, vacina: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Lote da Vacina"
            placeholder="Ex: LT2024A"
            value={form.lote}
            onChange={(e) => setForm({ ...form, lote: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'pendente' | 'aplicada' })
              }
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="pendente">Pendente</option>
              <option value="aplicada">Aplicada</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data de Aplicação"
            type="date"
            value={form.dataAplicacao}
            onChange={(e) => setForm({ ...form, dataAplicacao: e.target.value })}
          />
          <Input
            label="Data de Vencimento"
            type="date"
            value={form.dataVencimento}
            onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
          />
        </div>

        <Input
          label="Responsável"
          placeholder="Ex: Dr. João"
          value={form.responsavel}
          onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Adicione anotações aqui (opcional)"
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
