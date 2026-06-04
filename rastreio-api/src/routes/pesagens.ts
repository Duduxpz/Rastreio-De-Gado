import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/pesagens?animal_id=XXX
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { animal_id } = req.query;
    if (!animal_id) {
      return res.status(400).json({ error: 'animal_id is required' });
    }

    const { data, error } = await supabase
      .from('pesagens')
      .select('*')
      .eq('animal_id', animal_id as string)
      .order('data', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weighings' });
  }
});

// POST /api/pesagens
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('pesagens')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create weighing' });
  }
});

export default router;
