import { Router } from 'express';
import type { Response } from 'express';
import { authMiddleware, AuthRequest, verifyAnimalOwnership } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/vacinacoes?animal_id=XXX
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { animal_id } = req.query;
    if (!animal_id) {
      return res.status(400).json({ error: 'animal_id is required' });
    }

    const { valid } = await verifyAnimalOwnership([animal_id as string], req.fazendaId!);
    if (!valid) {
      return res.status(403).json({ error: 'Unauthorized animal access' });
    }

    const { data, error } = await supabase
      .from('vacinacoes')
      .select('*')
      .eq('animal_id', animal_id as string)
      .order('data', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ error: 'Failed to fetch vaccinations' });
  }
});

// POST /api/vacinacoes
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { animal_id } = req.body;
    if (!animal_id) {
      return res.status(400).json({ error: 'animal_id is required' });
    }

    const { valid } = await verifyAnimalOwnership([animal_id as string], req.fazendaId!);
    if (!valid) {
      return res.status(403).json({ error: 'Unauthorized animal access' });
    }

    const { data, error } = await supabase
      .from('vacinacoes')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating vaccination:', error);
    res.status(500).json({ error: 'Failed to create vaccination' });
  }
});

export default router;
