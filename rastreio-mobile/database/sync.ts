import NetInfo from '@react-native-community/netinfo';
import { api } from '../services/api';
import { getPendingSync, markAsSynced } from './schema';
import type { SyncPayload } from '../types';

export async function sincronizar(fazendaId: string) {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) {
    return { ok: false, error: 'Sem conexão com internet' };
  }

  try {
    const { animais, vacinacoes, pesagens } = getPendingSync();

    if (!animais.length && !vacinacoes.length && !pesagens.length) {
      return { ok: true, count: 0 };
    }

    const payload: SyncPayload = {
      fazenda_id: fazendaId,
      animais,
      vacinacoes,
      pesagens,
    };

    await api.post('/sync/push', payload);

    // Mark as synced after successful push
    markAsSynced('animais');
    markAsSynced('vacinacoes');
    markAsSynced('pesagens');

    return {
      ok: true,
      count: animais.length + vacinacoes.length + pesagens.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Sync error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Erro ao sincronizar',
    };
  }
}
