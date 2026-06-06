import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/recommendations?prioridade=1&acknowledged=false&limit=50
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { prioridade, acknowledged, limite = 50, offset = 0 } = req.query;
    const limit = Math.min(Number(limite), 100);

    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('fazenda_id', req.fazendaId)
      .order('prioridade', { ascending: true })
      .order('created_at', { ascending: false });

    // Optional filters
    if (prioridade) query = query.eq('prioridade', Number(prioridade));
    if (acknowledged !== undefined) query = query.eq('acknowledged', acknowledged === 'true');

    query = query.range(Number(offset), Number(offset) + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// GET /api/recommendations/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Recommendation not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Recommendation fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendation' });
  }
});

// POST /api/recommendations - Create recommendation
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { prioridade = 3, motivo, impacto, payload } = req.body;

    if (!motivo || !impacto) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: motivo, impacto',
      });
    }

    if (prioridade < 1 || prioridade > 5) {
      return res.status(400).json({
        success: false,
        error: 'prioridade must be between 1 and 5',
      });
    }

    const { data: recommendation, error } = await supabase
      .from('recommendations')
      .insert({
        fazenda_id: req.fazendaId,
        prioridade,
        motivo,
        impacto,
        payload: payload || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Recommendation creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create recommendation' });
  }
});

// PATCH /api/recommendations/:id - Update (acknowledge, etc)
router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { acknowledged, prioridade, motivo, impacto } = req.body;
    const updates: any = {};

    if (acknowledged !== undefined) updates.acknowledged = acknowledged;
    if (prioridade !== undefined) {
      if (prioridade < 1 || prioridade > 5) {
        return res.status(400).json({
          success: false,
          error: 'prioridade must be between 1 and 5',
        });
      }
      updates.prioridade = prioridade;
    }
    if (motivo !== undefined) updates.motivo = motivo;
    if (impacto !== undefined) updates.impacto = impacto;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    const { data, error } = await supabase
      .from('recommendations')
      .update(updates)
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Recommendation not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Recommendation update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update recommendation' });
  }
});

// DELETE /api/recommendations/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId);

    if (error) throw error;
    res.json({ success: true, message: 'Recommendation deleted' });
  } catch (error) {
    console.error('Recommendation deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete recommendation' });
  }
});

export default router;
