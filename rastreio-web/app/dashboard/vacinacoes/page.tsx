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
import { Syringe } from 'lucide-react';

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
    carregarVacinacoes();
  }, []);

  const carregarVacinacoes = () => {
    try {
      setLoading(true);
      const stored = typeof window !== 'undefined' ? localStorage.getItem('vacinacoes') : null;
      if (stored) {
        const dados = JSON.parse(stored);
        setVacinacoes(dados || []);
      } else {
        setVacinacoes([]);
      }
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

  const handleExcluir = (id: string) => {
    const atualizadas = vacinacoes.filter((v) => v.id !== id);
    localStorage.setItem('vacinacoes', JSON.stringify(atualizadas));
    setVacinacoes(atualizadas);
    notificarDashboard();
  };

  const handleSalvarVacinacao = (novaVacinacao: VacinacaoLocal) => {
    const atualizadas = [...vacinacoes, novaVacinacao];
    localStorage.setItem('vacinacoes', JSON.stringify(atualizadas));
    setVacinacoes(atualizadas);
    setShowModal(false);
    notificarDashboard();
  };

  if (loading) {
    return <LoadingState message="Carregando vacinações..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Vacinações"
        description="Registros sanitários do rebanho"
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Nova Vacinação
          </Button>
        }
      />

      {/* Busca */}
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

      {/* Tabela */}
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
                            handleExcluir(v.id);
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

      {/* Modal */}
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

  const [animais, setAnimais] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('animais');
      if (stored) {
        const dados = JSON.parse(stored);
        setAnimais(dados || []);
      }
    }
  }, [isOpen]);

  const handleSalvar = () => {
    const novaVacinacao: VacinacaoLocal = {
      id: Date.now().toString(),
      animalId: form.animalId || '',
      animalBrinco: form.animalBrinco || '',
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
        {/* Animal - Dropdown ou Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">Animal (Brinco)</label>
          {animais.length > 0 ? (
            <select
              value={form.animalId}
              onChange={(e) => {
                const animal = animais.find((a) => a.id === e.target.value);
                setForm({
                  ...form,
                  animalId: e.target.value,
                  animalBrinco: animal?.brinco || '',
                });
              }}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="">Selecionar animal...</option>
              {animais.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.brinco || `Animal #${a.id}`}
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

        {/* Vacina */}
        <Input
          label="Vacina"
          placeholder="Ex: Aftosa, Brucelose"
          value={form.vacina}
          onChange={(e) => setForm({ ...form, vacina: e.target.value })}
        />

        {/* Lote e Status */}
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

        {/* Datas */}
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

        {/* Responsável */}
        <Input
          label="Responsável"
          placeholder="Ex: Dr. João"
          value={form.responsavel}
          onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
        />

        {/* Observações */}
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
