import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/animais
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .eq('fazenda_id', req.fazendaId)
      .eq('ativo', true)
      .order('brinco');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// GET /api/animais/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

// POST /api/animais
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('animais')
      .insert({ ...req.body, fazenda_id: req.fazendaId })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating animal:', error);
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

// PUT /api/animais/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('animais')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating animal:', error);
    res.status(500).json({ error: 'Failed to update animal' });
  }
});

export default router;
