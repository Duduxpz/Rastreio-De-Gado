'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { notificarDashboard } from '@/lib/notificarDashboard';

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

interface AnimalLocal {
  id: string;
  brinco: string;
  raca: string;
  sexo: string;
  categoria: string;
  peso: number;
  lote: string;
  pasto: string;
}

export default function VacinacaoDetalhes() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [vacinacao, setVacinacao] = useState<VacinacaoLocal | null>(null);
  const [animal, setAnimal] = useState<AnimalLocal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = () => {
    try {
      setLoading(true);
      const vacinacoes = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
      const encontrada = vacinacoes.find((v: VacinacaoLocal) => v.id === id);

      if (!encontrada) {
        setVacinacao(null);
        return;
      }

      setVacinacao(encontrada);

      // Carregar animal vinculado se houver
      if (encontrada.animalId) {
        const animais = JSON.parse(localStorage.getItem('animais') || '[]');
        const animalEncontrado = animais.find((a: any) => a.id === encontrada.animalId);
        if (animalEncontrado) {
          setAnimal({
            id: animalEncontrado.id,
            brinco: animalEncontrado.brinco || '',
            raca: animalEncontrado.raca || '',
            sexo: animalEncontrado.sexo === 'Macho' ? 'M' : animalEncontrado.sexo === 'Fêmea' ? 'F' : '',
            categoria: (animalEncontrado.categoria || '').toLowerCase(),
            peso: animalEncontrado.peso || null,
            lote: animalEncontrado.lote || '',
            pasto: animalEncontrado.pasto || '',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vacinação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarAplicada = () => {
    try {
      const vacinacoes = JSON.parse(localStorage.getItem('vacinacoes') || '[]');
      const atualizadas = vacinacoes.map((v: VacinacaoLocal) =>
        v.id === id
          ? {
              ...v,
              status: 'aplicada' as const,
              dataAplicacao: v.dataAplicacao || new Date().toISOString().split('T')[0],
            }
          : v
      );
      localStorage.setItem('vacinacoes', JSON.stringify(atualizadas));
      setVacinacao((prev) =>
        prev ? { ...prev, status: 'aplicada' } : prev
      );
      notificarDashboard();
    } catch (error) {
      console.error('Erro ao atualizar vacinação:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando vacinação..." />;
  }

  if (!vacinacao) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="💉"
          title="Vacinação não encontrada"
          description="A vacinação solicitada não existe"
          action={{
            label: '← Voltar',
            onClick: () => router.push('/dashboard/vacinacoes'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/vacinacoes')}
          className="text-orange-400 hover:text-orange-500 font-medium transition flex items-center gap-2"
        >
          ← Voltar
        </button>
      </div>

      {/* Título e Status */}
      <PageHeader
        title={`Vacinação — ${vacinacao.vacina || 'Sem nome'}`}
        description={vacinacao.criadoEm ? new Date(vacinacao.criadoEm).toLocaleDateString('pt-BR') : ''}
      />

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge
          label={vacinacao.status === 'aplicada' ? 'Aplicada' : 'Pendente'}
          variant={vacinacao.status === 'aplicada' ? 'success' : 'warning'}
        />
      </div>

      {/* Detalhes Principais */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Coluna 1 */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Animal
              </label>
              <p className="text-lg font-medium text-white">
                {vacinacao.animalBrinco ? `Brinco ${vacinacao.animalBrinco}` : '—'}
              </p>
            </div>

            {/* Coluna 2 */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Vacina
              </label>
              <p className="text-lg font-medium text-white">{vacinacao.vacina || '—'}</p>
            </div>

            {/* Coluna 3 */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Lote
              </label>
              <p className="text-gray-300">{vacinacao.lote || '—'}</p>
            </div>

            {/* Coluna 4 */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Data de Aplicação
              </label>
              <p className="text-gray-300">{vacinacao.dataAplicacao || '—'}</p>
            </div>

            {/* Coluna 5 */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Data de Vencimento
              </label>
              <p className="text-gray-300">{vacinacao.dataVencimento || '—'}</p>
            </div>

            {/* Coluna 6 */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Responsável
              </label>
              <p className="text-gray-300">{vacinacao.responsavel || '—'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Observações */}
      {vacinacao.observacoes && (
        <Card className="p-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
            Observações
          </label>
          <p className="text-gray-300 leading-relaxed">{vacinacao.observacoes}</p>
        </Card>
      )}

      {/* Animal Vinculado */}
      {animal && (
        <Card className="p-6">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-4">
            Animal Vinculado
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Brinco</p>
                <p className="font-semibold text-white">Brinco {animal.brinco}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Raça</p>
                <p className="text-gray-300">{animal.raca || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Categoria</p>
                <p className="text-gray-300">{(animal.category || '').toUpperCase() || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Sexo</p>
                <p className="text-gray-300">{animal.sexo || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Peso</p>
                <p className="text-gray-300">{animal.peso ? `${animal.peso} kg` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase mb-1">Lote</p>
                <p className="text-gray-300">{animal.lote || '—'}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/animais/${animal.id}`)}
              className="text-orange-400 hover:text-orange-500 font-medium transition text-sm mt-2"
            >
              Ver Animal →
            </button>
          </div>
        </Card>
      )}

      {/* Ações */}
      <div className="flex gap-4">
        {vacinacao.status === 'pendente' && (
          <Button variant="primary" onClick={handleMarcarAplicada}>
            ✓ Marcar como Aplicada
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/vacinacoes')}
        >
          Voltar para Listagem
        </Button>
      </div>
    </div>
  );
}
