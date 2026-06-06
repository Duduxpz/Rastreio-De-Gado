import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/alerts?nivel=CRITICAL&lida=false&limit=50
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { nivel, lida, limite = 50, offset = 0 } = req.query;
    const limit = Math.min(Number(limite), 100);

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('fazenda_id', req.fazendaId)
      .order('created_at', { ascending: false });

    // Optional filters
    if (nivel) query = query.eq('nivel', nivel);
    if (lida !== undefined) query = query.eq('lida', lida === 'true');

    query = query.range(Number(offset), Number(offset) + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Alert not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Alert fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alert' });
  }
});

// POST /api/alerts
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { tipo, nivel = 'INFO', titulo, descricao, data } = req.body;

    if (!tipo || !titulo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tipo, titulo',
      });
    }

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert({
        fazenda_id: req.fazendaId,
        tipo,
        nivel: nivel.toUpperCase(),
        titulo,
        descricao,
        data: data || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    console.error('Alert creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

// PATCH /api/alerts/:id - Mark as read/archived
router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { lida, arquivada } = req.body;
    const updates: any = {};

    if (lida !== undefined) updates.lida = lida;
    if (arquivada !== undefined) updates.arquivada = arquivada;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Alert not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Alert update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', req.params.id)
      .eq('fazenda_id', req.fazendaId);

    if (error) throw error;
    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    console.error('Alert deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

// PATCH /api/alerts/batch/read - Mark multiple as read
router.patch('/batch/read', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ids must be a non-empty array',
      });
    }

    const { data, error } = await supabase
      .from('alerts')
      .update({ lida: true })
      .in('id', ids)
      .eq('fazenda_id', req.fazendaId)
      .select();

    if (error) throw error;
    res.json({ success: true, updated: data?.length || 0 });
  } catch (error) {
    console.error('Batch alert read error:', error);
    res.status(500).json({ success: false, error: 'Failed to update alerts' });
  }
});

export default router;
