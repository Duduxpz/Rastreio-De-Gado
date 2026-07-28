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

    if (error) {
      console.error('Database error fetching animals:', error);
      throw error;
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching animals:', error);
    res.status(500).json({
      error: 'Não foi possível carregar os animais.',
      code: 'FETCH_ERROR',
    });
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

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum resultado encontrado
        return res.status(404).json({
          error: 'Animal não encontrado.',
          code: 'NOT_FOUND',
        });
      }
      throw error;
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching animal:', error);
    res.status(500).json({
      error: 'Não foi possível carregar o animal.',
      code: 'FETCH_ERROR',
    });
  }
});

// POST /api/animais
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const body = req.body ?? {};
    const errors: string[] = [];

    // === VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ===
    if (!body?.brinco || String(body.brinco).trim() === '') {
      errors.push('O brinco é obrigatório.');
    }

    // === VALIDAÇÃO DE ESPÉCIE ===
    let especie = 'bovino';
    if (body?.especie) {
      if (!ESPECIES_VALIDAS.includes(body.especie)) {
        errors.push(
          `Espécie inválida: "${body.especie}". Espécies válidas: ${ESPECIES_VALIDAS.join(', ')}.`
        );
      } else {
        especie = body.especie;
      }
    }

    // === VALIDAÇÃO DE NOME (OBRIGATÓRIO PARA EQUINOS) ===
    if (especie === 'equino' && (!body?.nome || String(body.nome).trim() === '')) {
      errors.push('Nome é obrigatório para equinos. Informe o nome do animal.');
    }

    // === VALIDAÇÃO DE SEXO ===
    if (body?.sexo && !['M', 'F'].includes(String(body.sexo))) {
      errors.push('Sexo inválido. Deve ser "M" (macho) ou "F" (fêmea).');
    }

    // === VALIDAÇÃO DE CATEGORIA (DEPENDENTE DE ESPÉCIE) ===
    if (body?.categoria) {
      const categoriasValidas = CATEGORIAS_POR_ESPECIE[especie];
      if (!categoriasValidas.includes(String(body.categoria))) {
        errors.push(
          `Categoria inválida: "${body.categoria}". Categorias válidas para ${especie}: ${categoriasValidas.join(', ')}.`
        );
      }
    }

    // === VALIDAÇÃO DE PESO ===
    if (body?.peso_atual !== undefined && body?.peso_atual !== null && body?.peso_atual !== '') {
      const pesoNum = Number(body.peso_atual);
      if (Number.isNaN(pesoNum)) {
        errors.push('Peso deve ser um número válido.');
      } else if (pesoNum <= 0) {
        errors.push('Peso deve ser maior que zero.');
      }
    }

    // === RETORNAR ERROS DE VALIDAÇÃO ===
    if (errors.length > 0) {
      return res.status(400).json({
        error: errors[0],
        details: errors, // Cliente pode usar para feedback detalhado
        code: 'VALIDATION_ERROR',
      });
    }

    // === MONTAR PAYLOAD ===
    const payload = {
      id: body?.id || crypto.randomUUID(),
      fazenda_id: req.fazendaId,
      brinco: String(body.brinco).trim(),
      nome: body?.nome ? String(body.nome).trim() : null,
      especie,
      raca: body?.raca ? String(body.raca).trim() : null,
      sexo: body?.sexo ? String(body.sexo).toUpperCase() : null,
      data_nascimento: body?.data_nascimento ?? null,
      peso_atual:
        body?.peso_atual !== undefined && body?.peso_atual !== null && body?.peso_atual !== ''
          ? Number(body.peso_atual)
          : null,
      lote: body?.lote ? String(body.lote).trim() : null,
      pasto: body?.pasto ? String(body.pasto).trim() : null,
      categoria: body?.categoria ?? null,
      ativo: body?.ativo !== false,
      updated_at: new Date().toISOString(),
    };

    // === INSERIR NO BANCO ===
    const { data, error } = await supabase
      .from('animais')
      .insert(payload)
      .select()
      .single();

    // === TRATAMENTO DE ERROS DO BANCO ===
    if (error) {
      console.error('Database error creating animal:', {
        code: error.code,
        message: error.message,
        details: error.details,
        payload,
      });

      // Erro de constraint única (já existe animal com este brinco nesta fazenda)
      if (error.code === '23505') {
        return res.status(409).json({
          error: `Já existe um animal com o brinco "${payload.brinco}" nesta fazenda.`,
          code: 'DUPLICATE_BRINCO',
        });
      }

      // Erro de foreign key (fazenda_id não existe)
      if (error.code === '23503') {
        return res.status(400).json({
          error: 'Fazenda não localizada. Verifique sua autenticação.',
          code: 'INVALID_FAZENDA_ID',
        });
      }

      // Erro de constraint de check (category inválida para espécie, por exemplo)
      if (error.code === '23514') {
        return res.status(400).json({
          error: 'Os dados do animal violam uma restrição do banco de dados. Verifique espécie, categoria e outros campos.',
          code: 'CHECK_CONSTRAINT_VIOLATION',
          details: error.message,
        });
      }

      // Coluna não existe (erro de migração não aplicada)
      if (error.code === '42703') {
        console.error('CRITICAL: Migration 004 not applied. Missing columns in animais table.');
        return res.status(500).json({
          error: 'Erro de configuração do servidor: banco de dados não foi atualizado. Contate o suporte.',
          code: 'MIGRATION_NOT_APPLIED',
        });
      }

      // Erro genérico do banco
      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Unhandled error creating animal:', {
      message: error?.message,
      stack: error?.stack,
      error,
    });
    res.status(500).json({
      error: 'Não foi possível criar o animal. Verifique os dados e tente novamente.',
      code: 'INTERNAL_ERROR',
      details:
        process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
});

// PUT /api/animais/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const animalId = req.params.id;
    const body = req.body ?? {};
    const updates: Record<string, any> = {};

    // === VALIDAÇÃO DE ESPÉCIE (SE SENDO ATUALIZADA) ===
    if (body?.especie !== undefined) {
      if (!ESPECIES_VALIDAS.includes(body.especie)) {
        return res.status(400).json({
          error: `Espécie inválida: "${body.especie}". Espécies válidas: ${ESPECIES_VALIDAS.join(', ')}.`,
          code: 'INVALID_ESPECIE',
        });
      }
      updates.especie = body.especie;
    }

    // === VALIDAÇÃO DE SEXO ===
    if (body?.sexo !== undefined) {
      if (body.sexo && !['M', 'F'].includes(String(body.sexo))) {
        return res.status(400).json({
          error: 'Sexo inválido. Deve ser "M" (macho), "F" (fêmea) ou null.',
          code: 'INVALID_SEXO',
        });
      }
      updates.sexo = body.sexo;
    }

    // === VALIDAÇÃO DE PESO ===
    if (body?.peso_atual !== undefined) {
      if (body.peso_atual !== null && body.peso_atual !== '') {
        const pesoNum = Number(body.peso_atual);
        if (Number.isNaN(pesoNum)) {
          return res.status(400).json({
            error: 'Peso deve ser um número válido.',
            code: 'INVALID_PESO',
          });
        }
        if (pesoNum <= 0) {
          return res.status(400).json({
            error: 'Peso deve ser maior que zero.',
            code: 'INVALID_PESO',
          });
        }
        updates.peso_atual = pesoNum;
      } else {
        updates.peso_atual = null;
      }
    }

    // === VALIDAÇÃO DE CATEGORIA (REQUER ESPÉCIE) ===
    if (body?.categoria !== undefined) {
      // Buscar animal atual para saber a espécie
      const { data: animal, error: fetchError } = await supabase
        .from('animais')
        .select('especie')
        .eq('id', animalId)
        .eq('fazenda_id', req.fazendaId)
        .single();

      if (fetchError || !animal) {
        return res.status(404).json({
          error: 'Animal não encontrado.',
          code: 'NOT_FOUND',
        });
      }

      if (body.categoria !== null) {
        const categoriasValidas = CATEGORIAS_POR_ESPECIE[animal.especie];
        if (!categoriasValidas.includes(String(body.categoria))) {
          return res.status(400).json({
            error: `Categoria inválida para ${animal.especie}: "${body.categoria}". Categorias válidas: ${categoriasValidas.join(', ')}.`,
            code: 'INVALID_CATEGORIA',
          });
        }
      }
      updates.categoria = body.categoria;
    }

    // === PERMITIR ATUALIZAÇÃO DE OUTROS CAMPOS ===
    if (body?.brinco !== undefined) updates.brinco = String(body.brinco).trim();
    if (body?.nome !== undefined) updates.nome = body.nome ? String(body.nome).trim() : null;
    if (body?.raca !== undefined) updates.raca = body.raca ? String(body.raca).trim() : null;
    if (body?.data_nascimento !== undefined) updates.data_nascimento = body.data_nascimento;
    if (body?.lote !== undefined) updates.lote = body.lote ? String(body.lote).trim() : null;
    if (body?.pasto !== undefined) updates.pasto = body.pasto ? String(body.pasto).trim() : null;
    if (body?.ativo !== undefined) updates.ativo = body.ativo;

    updates.updated_at = new Date().toISOString();

    // === ATUALIZAR NO BANCO ===
    const { data, error } = await supabase
      .from('animais')
      .update(updates)
      .eq('id', animalId)
      .eq('fazenda_id', req.fazendaId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating animal:', {
        code: error.code,
        message: error.message,
        animalId,
        updates,
      });

      // Erro de constraint única (brinco duplicado)
      if (error.code === '23505') {
        return res.status(409).json({
          error: `Já existe um animal com o brinco "${updates.brinco}" nesta fazenda.`,
          code: 'DUPLICATE_BRINCO',
        });
      }

      // Erro de check constraint
      if (error.code === '23514') {
        return res.status(400).json({
          error: 'Os dados do animal violam uma restrição do banco de dados.',
          code: 'CHECK_CONSTRAINT_VIOLATION',
          details: error.message,
        });
      }

      throw error;
    }

    if (!data) {
      return res.status(404).json({
        error: 'Animal não encontrado.',
        code: 'NOT_FOUND',
      });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Unhandled error updating animal:', {
      message: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({
      error: 'Não foi possível atualizar o animal.',
      code: 'INTERNAL_ERROR',
      details:
        process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
});

export default router;
