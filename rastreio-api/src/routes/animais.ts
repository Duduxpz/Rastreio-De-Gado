import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

const ESPECIES_VALIDAS = ['bovino', 'equino', 'ovino', 'caprino', 'suino', 'ave'] as const;

const CATEGORIAS_POR_ESPECIE: Record<string, string[]> = {
  bovino: ['bezerro', 'novilha', 'vaca', 'touro', 'boi', 'outro'],
  equino: ['potro', 'potranca', 'egua', 'garanhao', 'castrado', 'outro'],
  ovino: ['cordeiro', 'borrega', 'ovelha', 'carneiro', 'outro'],
  caprino: ['cabrito', 'caprina', 'cabra', 'bode', 'outro'],
  suino: ['leitao', 'marra', 'porca', 'cachaco', 'outro'],
  ave: ['pintainho', 'frango', 'poedeira', 'matriz', 'reprodutor', 'outro'],
};

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
    const body = req.body ?? {};
    const errors: string[] = [];

    if (!body?.brinco || String(body.brinco).trim() === '') {
      errors.push('O brinco é obrigatório.');
    }

    if (body?.sexo && !['M', 'F'].includes(String(body.sexo))) {
      errors.push('O sexo deve ser M ou F.');
    }

    const especie = ESPECIES_VALIDAS.includes(body?.especie) ? String(body.especie) : 'bovino';
    if (body?.especie && !ESPECIES_VALIDAS.includes(body.especie)) {
      errors.push('A espécie informada é inválida.');
    }

    // Cavalos (e demais espécies onde o nome é o principal identificador)
    // precisam de um nome preenchido para permitir a busca por nome.
    if (especie === 'equino' && (!body?.nome || String(body.nome).trim() === '')) {
      errors.push('Informe o nome do animal (obrigatório para equinos).');
    }

    if (body?.categoria) {
      const categoriasValidas = CATEGORIAS_POR_ESPECIE[especie] || CATEGORIAS_POR_ESPECIE.bovino;
      if (!categoriasValidas.includes(String(body.categoria))) {
        errors.push('A categoria informada é inválida para a espécie selecionada.');
      }
    }

    if (body?.peso_atual !== undefined && body?.peso_atual !== null && Number.isNaN(Number(body.peso_atual))) {
      errors.push('O peso deve ser numérico.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] });
    }

    const payload = {
      id: body?.id || crypto.randomUUID(),
      fazenda_id: req.fazendaId,
      brinco: String(body.brinco).trim(),
      nome: body?.nome ? String(body.nome).trim() : null,
      especie,
      raca: body?.raca ?? null,
      sexo: body?.sexo ?? null,
      data_nascimento: body?.data_nascimento ?? null,
      peso_atual: body?.peso_atual !== undefined && body?.peso_atual !== null && body?.peso_atual !== '' ? Number(body.peso_atual) : null,
      lote: body?.lote ?? null,
      pasto: body?.pasto ?? null,
      categoria: body?.categoria ?? null,
      ativo: body?.ativo ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('animais')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe um animal com este brinco para a fazenda.' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating animal:', error);
    res.status(500).json({ error: 'Não foi possível criar o animal. Verifique os dados e tente novamente.' });
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
