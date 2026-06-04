import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import type { SyncPayload } from '../../../rastreio-mobile/types';

const router = Router();

// POST /api/sync/push
router.post('/push', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { animais, vacinacoes, pesagens, fazenda_id } = req.body as SyncPayload;

    // Verify farm ownership
    if (fazenda_id !== req.fazendaId) {
      return res.status(403).json({ error: 'Unauthorized farm' });
    }

    // Upsert animals
    if (animais?.length) {
      const { error } = await supabase.from('animais').upsert(
        animais.map((a: any) => ({ ...a, fazenda_id })),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    // Upsert vaccinations
    if (vacinacoes?.length) {
      const { error } = await supabase
        .from('vacinacoes')
        .upsert(vacinacoes, { onConflict: 'id' });
      if (error) throw error;
    }

    // Upsert weighings
    if (pesagens?.length) {
      const { error } = await supabase
        .from('pesagens')
        .upsert(pesagens, { onConflict: 'id' });
      if (error) throw error;
    }

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      synced: {
        animais: animais?.length || 0,
        vacinacoes: vacinacoes?.length || 0,
        pesagens: pesagens?.length || 0,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

export default router;
