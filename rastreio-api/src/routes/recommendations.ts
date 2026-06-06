import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { BuiltinAIProvider } from '../lib/ai';
import type { Prioridade, RecommendationStatus } from '../lib/ai';

const router = Router();
const aiProvider = new BuiltinAIProvider();

/**
 * GET /api/recommendations
 * Lista recomendações com filtros por prioridade e status
 * Query: ?prioridade=ALTA&status=PENDENTE&limite=50&offset=0
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      prioridade,
      status,
      limite = 50,
      offset = 0,
    } = req.query;
    const limit = Math.min(Number(limite), 100);

    let query = supabase
      .from('recommendations')
      .select('*')
      .eq('fazenda_id', req.fazendaId)
      .order('prioridade', { ascending: false })
      .order('created_at', { ascending: false });

    // Filters
    if (prioridade) {
      query = query.eq('prioridade', prioridade as string);
    }
    if (status) {
      query = query.eq('status', status as string);
    }

    query = query.range(Number(offset), Number(offset) + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data: data || [], total: count || 0 });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

/**
 * GET /api/recommendations/metrics
 * Retorna métricas resumidas de recomendações
 */
router.get('/metrics', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data: allRecs, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('fazenda_id', req.fazendaId);

    if (error) throw error;

    const recs = allRecs || [];
    const metrics = {
      total: recs.length,
      pendentes: recs.filter((r) => r.status === 'PENDENTE').length,
      reconhecidas: recs.filter((r) => r.status === 'RECONHECIDA').length,
      resolvidas: recs.filter((r) => r.status === 'RESOLVIDA').length,
      altaPrioridade: recs.filter((r) => r.prioridade === 'ALTA').length,
    };

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
});

/**
 * POST /api/recommendations/generate
 * Gera recomendações automáticas baseadas em dados do rebanho
 */
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Buscar dados da fazenda
    const [animaisResult, vacinacoesResult, pesagensResult] = await Promise.all([
      supabase
        .from('animais')
        .select('*')
        .eq('fazenda_id', req.fazendaId),
      supabase
        .from('vacinacoes')
        .select('*')
        .in(
          'animal_id',
          (await supabase
            .from('animais')
            .select('id')
            .eq('fazenda_id', req.fazendaId)
            .then((r) => r.data?.map((a) => a.id) || []))
        ),
      supabase
        .from('pesagens')
        .select('*')
        .in(
          'animal_id',
          (await supabase
            .from('animais')
            .select('id')
            .eq('fazenda_id', req.fazendaId)
            .then((r) => r.data?.map((a) => a.id) || []))
        ),
    ]);

    const context = {
      fazendaId: req.fazendaId,
      animais: animaisResult.data || [],
      vacinacoes: vacinacoesResult.data || [],
      pesagens: pesagensResult.data || [],
    };

    // Gerar recomendação
    const recommendation = await aiProvider.generateRecommendation(context);

    // Verificar se já existe recomendação similar
    const { data: existing } = await supabase
      .from('recommendations')
      .select('id')
      .eq('fazenda_id', req.fazendaId)
      .eq('titulo', recommendation.titulo)
      .eq('status', 'PENDENTE')
      .limit(1);

    if (existing && existing.length > 0) {
      // Atualizar a existente
      const { data, error } = await supabase
        .from('recommendations')
        .update({
          descricao: recommendation.descricao,
          impacto: recommendation.impacto,
          sugestao: recommendation.sugestao,
          analiseIA: recommendation.analiseIA,
          payload: recommendation.payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data, isNew: false });
    }

    // Inserir nova
    const { data, error } = await supabase
      .from('recommendations')
      .insert({
        fazenda_id: req.fazendaId,
        prioridade: recommendation.prioridade,
        titulo: recommendation.titulo,
        descricao: recommendation.descricao,
        impacto: recommendation.impacto,
        sugestao: recommendation.sugestao,
        analiseIA: recommendation.analiseIA,
        status: 'PENDENTE',
        payload: recommendation.payload || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data, isNew: true });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendation' });
  }
});

/**
 * GET /api/recommendations/:id
 * Obtém uma recomendação específica
 */
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

/**
 * PATCH /api/recommendations/:id
 * Atualiza status ou outros campos de uma recomendação
 * Body: { status?: 'PENDENTE'|'RECONHECIDA'|'RESOLVIDA' }
 */
router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const updates: any = {};

    if (status) {
      const validStatuses: RecommendationStatus[] = ['PENDENTE', 'RECONHECIDA', 'RESOLVIDA'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be PENDENTE, RECONHECIDA, or RESOLVIDA',
        });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    updates.updated_at = new Date().toISOString();

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

/**
 * DELETE /api/recommendations/:id
 * Remove uma recomendação
 */
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
