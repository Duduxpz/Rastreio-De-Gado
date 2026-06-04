import { useState } from 'react';
import { sincronizar } from '../database/sync';

export function useSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = async (fazendaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await sincronizar(fazendaId);
      if (!result.ok) {
        setError(result.error || 'Erro ao sincronizar');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { sync, loading, error };
}
