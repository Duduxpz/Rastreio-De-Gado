import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/analytics/overview?days=30
router.get('/overview', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    // Fetch active animals for the farm
    const { data: animais = [], error: errA } = await supabase
      .from('animais')
      .select('*')
      .eq('fazenda_id', req.fazendaId)
      .eq('ativo', true);
    if (errA) throw errA;

    const animalIds = (animais as any[]).map((a) => a.id);

    // Fetch pesagens for these animals
    let pesagens: any[] = [];
    if (animalIds.length) {
      const { data: p = [], error: errP } = await supabase
        .from('pesagens')
        .select('*')
        .in('animal_id', animalIds);
      if (errP) throw errP;
      pesagens = p;
    }

    // Fetch vacinacoes for these animals
    let vacinacoes: any[] = [];
    if (animalIds.length) {
      const { data: v = [], error: errV } = await supabase
        .from('vacinacoes')
        .select('*')
        .in('animal_id', animalIds);
      if (errV) throw errV;
      vacinacoes = v;
    }

    // Compute last weighing per animal
    const lastPesoByAnimal: Record<string, any> = {};
    pesagens.forEach((p) => {
      const cur = lastPesoByAnimal[p.animal_id];
      const dt = new Date(p.data || p.created_at || p.createdAt);
      if (!cur || dt > new Date(cur.data || cur.created_at)) lastPesoByAnimal[p.animal_id] = p;
    });

    const now = new Date();
    const animaisSemPesagemRecente = (animais as any[]).filter((a) => {
      const last = lastPesoByAnimal[a.id];
      if (!last) return true;
      const lastDate = new Date(last.data || last.created_at || last.createdAt);
      return lastDate < threshold;
    }).length;

    // Vaccination pendings: proxima_dose present and <= now
    const vacinacoesPendentes = vacinacoes.filter((v) => v.proxima_dose && new Date(v.proxima_dose) <= now).length;

    // Average weight (use peso_atual if present, otherwise last pesagem)
    let pesoSum = 0;
    let pesoCount = 0;
    (animais as any[]).forEach((a) => {
      if (a.peso_atual) {
        pesoSum += Number(a.peso_atual);
        pesoCount += 1;
      } else if (lastPesoByAnimal[a.id]) {
        pesoSum += Number(lastPesoByAnimal[a.id].peso || 0);
        pesoCount += 1;
      }
    });
    const avgPeso = pesoCount ? +(pesoSum / pesoCount).toFixed(2) : null;

    const totalAnimais = (animais as any[]).length;

    // Simple heuristic for rebanho score (0-100)
    let score = 100;
    if (totalAnimais === 0) score = 0;
    else {
      const pctSemPesagem = (animaisSemPesagemRecente / totalAnimais) * 100;
      const pctVaccinePending = (vacinacoesPendentes / Math.max(1, totalAnimais)) * 100;

      // Penalize: recentness of weighings and pending vaccines
      score -= Math.min(40, Math.round(pctSemPesagem * 0.8));
      score -= Math.min(30, Math.round(pctVaccinePending * 0.6));

      // Penalize missing cadastro fields (raca or lote) per animal
      const missingCadastro = (animais as any[]).filter((a) => !a.raca || !a.lote).length;
      const pctMissing = (missingCadastro / totalAnimais) * 100;
      score -= Math.min(15, Math.round(pctMissing * 0.3));
    }
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Top issues for quick display
    const topIssues = [];
    if (animaisSemPesagemRecente > 0) topIssues.push({ key: 'sem_pesagem', count: animaisSemPesagemRecente, message: `Animais sem pesagem nos últimos ${days} dias` });
    if (vacinacoesPendentes > 0) topIssues.push({ key: 'vacinas_pendentes', count: vacinacoesPendentes, message: 'Vacinações com próxima dose vencida' });

    res.json({
      total_animais: totalAnimais,
      animais_sem_pesagem_recente: animaisSemPesagemRecente,
      vacinacoes_pendentes: vacinacoesPendentes,
      avg_peso: avgPeso,
      rebanho_score: score,
      top_issues: topIssues,
      computed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to compute analytics overview' });
  }
});

export default router;
