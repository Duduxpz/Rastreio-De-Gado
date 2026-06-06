import { Router } from 'express';
import { authMiddleware, AuthRequest, verifyAnimalOwnership } from '../middleware/auth';
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

    const animalIdsFromAnimals = animais?.filter((a: any) => !!a.id).map((a: any) => a.id) ?? [];
    if (animalIdsFromAnimals.length) {
      const { data: existingAnimals, error: animaisError } = await supabase
        .from('animais')
        .select('id, fazenda_id')
        .in('id', animalIdsFromAnimals);
      if (animaisError) throw animaisError;

      const invalidAnimalIds = (existingAnimals || [])
        .filter((a: any) => a.fazenda_id !== req.fazendaId)
        .map((a: any) => a.id);
      if (invalidAnimalIds.length) {
        return res.status(403).json({ error: 'Unauthorized animal IDs in payload', invalidAnimalIds });
      }
    }

    const referencedAnimalIds = [
      ...(vacinacoes?.map((v: any) => v.animal_id).filter(Boolean) ?? []),
      ...(pesagens?.map((p: any) => p.animal_id).filter(Boolean) ?? []),
    ];
    const uniqueReferencedIds = [...new Set(referencedAnimalIds)];

    if (uniqueReferencedIds.length) {
      const { data: existingReferencingAnimals, error: refError } = await supabase
        .from('animais')
        .select('id, fazenda_id')
        .in('id', uniqueReferencedIds);
      if (refError) throw refError;

      const missingIds = uniqueReferencedIds.filter(
        (id) => !(existingReferencingAnimals || []).some((animal: any) => animal.id === id)
      );
      if (missingIds.length) {
        return res.status(400).json({ error: 'Referenced animal IDs not found', missingIds });
      }

      const invalidReferencedIds = (existingReferencingAnimals || [])
        .filter((animal: any) => animal.fazenda_id !== req.fazendaId)
        .map((animal: any) => animal.id);
      if (invalidReferencedIds.length) {
        return res.status(403).json({ error: 'Unauthorized referenced animal IDs', invalidReferencedIds });
      }
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
