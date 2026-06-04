import { useEffect, useState } from 'react';
import { getAnimais, getAnimalById } from '../database/schema';
import type { Animal } from '../types';

export function useAnimais(fazendaId: string) {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = getAnimais(fazendaId);
      setAnimais(data);
    } catch (error) {
      console.error('Error loading animals:', error);
    } finally {
      setLoading(false);
    }
  }, [fazendaId]);

  return { animais, loading, refetch: () => setAnimais(getAnimais(fazendaId)) };
}

export function useAnimal(id: string) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = getAnimalById(id);
      setAnimal(data);
    } catch (error) {
      console.error('Error loading animal:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { animal, loading, refetch: () => setAnimal(getAnimalById(id)) };
}
