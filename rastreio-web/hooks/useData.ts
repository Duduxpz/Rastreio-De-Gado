'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Animal, Vacinacao, Pesagem } from '@/types';

export function useAnimais() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimais = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Não autenticado');
        return;
      }

      const { data, error: err } = await supabase
        .from('animais')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setAnimais(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimais();
  }, [fetchAnimais]);

  return { animais, loading, error, refetch: fetchAnimais };
}

export function useVacinacoes(animalId?: string) {
  const [vacinacoes, setVacinacoes] = useState<Vacinacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('vacinacoes').select('*');
      
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }

      const { data, error: err } = await query.order('data', { ascending: false });
      if (err) throw err;
      setVacinacoes(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vacinações');
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { vacinacoes, loading, error, refetch: fetch };
}

export function usePesagens(animalId?: string) {
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('pesagens').select('*');
      
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }

      const { data, error: err } = await query.order('data', { ascending: false });
      if (err) throw err;
      setPesagens(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pesagens');
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { pesagens, loading, error, refetch: fetch };
}
