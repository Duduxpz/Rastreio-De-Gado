import { useEffect, useState } from 'react';
import animaisRepo from '../repositories/AnimaisRepository';
import { Animal } from '../types';
import queue from '../sync/queue';
import { v4 as uuidv4 } from 'uuid';

export function useAnimais() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const list = await animaisRepo.listAll();
      setAnimais(list);
    } finally {
      setLoading(false);
    }
  }

  async function create(animal: Omit<Animal, 'id' | 'updated_at' | 'synced'>) {
    const item: Animal = {
      ...animal,
      id: uuidv4(),
      updated_at: new Date().toISOString(),
      synced: 0,
    } as Animal;
    await animaisRepo.create(item);
    // enqueue push to sync endpoint
    queue.enqueue('/api/sync/push', { animais: [item] });
    await loadAll();
  }

  async function refresh() {
    await loadAll();
  }

  useEffect(() => {
    loadAll();
  }, []);

  return { animais, loading, create, refresh } as const;
}

export default useAnimais;
