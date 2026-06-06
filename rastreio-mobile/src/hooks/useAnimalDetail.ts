import { useEffect, useState } from 'react';
import animaisRepo from '../repositories/AnimaisRepository';
import vacinacoesRepo from '../repositories/VacinacoesRepository';
import pesagensRepo from '../repositories/PesagensRepository';
import queue from '../sync/queue';
import { v4 as uuidv4 } from 'uuid';
import type { Animal, Vacinacao, Pesagem } from '../types';
import type { VacinacaoFormValues } from '../validators/vacinacao';
import type { PesagemFormValues } from '../validators/pesagem';

export function useAnimalDetail(animalId: string) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vacinacoes, setVacinacoes] = useState<Vacinacao[]>([]);
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const animalData = await animaisRepo.findById(animalId);
      setAnimal(animalData);
      const vacData = await vacinacoesRepo.listByAnimal(animalId);
      setVacinacoes(vacData);
      const pesData = await pesagensRepo.listByAnimal(animalId);
      setPesagens(pesData);
    } finally {
      setLoading(false);
    }
  }

  async function addVacinacao(values: VacinacaoFormValues) {
    if (!animal) return;
    const item: Vacinacao = {
      id: uuidv4(),
      animal_id: animalId,
      vacina: values.vacina,
      data: values.data,
      dose: values.dose,
      veterinario: values.veterinario,
      proxima_dose: values.proxima_dose,
      created_at: new Date().toISOString(),
      synced: 0,
    };
    await vacinacoesRepo.create(item);
    queue.enqueue('/api/sync/push', { vacinacoes: [item] });
    await loadData();
  }

  async function addPesagem(values: PesagemFormValues) {
    if (!animal) return;
    const pesoNumber = Number(values.peso);
    if (Number.isNaN(pesoNumber)) return;
    const item: Pesagem = {
      id: uuidv4(),
      animal_id: animalId,
      peso: pesoNumber,
      data: values.data,
      observacao: values.observacao,
      created_at: new Date().toISOString(),
      synced: 0,
    };
    await pesagensRepo.create(item);
    queue.enqueue('/api/sync/push', { pesagens: [item] });

    await animaisRepo.create({
      ...animal,
      peso_atual: pesoNumber,
      updated_at: new Date().toISOString(),
      synced: 0,
    });

    await loadData();
  }

  useEffect(() => {
    if (!animalId) return;
    loadData();
  }, [animalId]);

  return { animal, vacinacoes, pesagens, loading, loadData, addVacinacao, addPesagem } as const;
}

export default useAnimalDetail;
