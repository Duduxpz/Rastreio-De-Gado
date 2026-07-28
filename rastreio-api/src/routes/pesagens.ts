import { Router } from 'express';
import { authMiddleware, AuthRequest, verifyAnimalOwnership } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/pesagens?animal_id=XXX
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { animal_id } = req.query;
    if (!animal_id) {
      return res.status(400).json({
        error: 'animal_id é obrigatório na query string.',
        code: 'MISSING_PARAMETER',
      });
    }

    const { valid } = await verifyAnimalOwnership([animal_id as string], req.fazendaId!);
    if (!valid) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este animal.',
        code: 'UNAUTHORIZED_ACCESS',
      });
    }

    const { data, error } = await supabase
      .from('pesagens')
      .select('*')
      .eq('animal_id', animal_id as string)
      .order('data', { ascending: false });

    if (error) {
      console.error('Database error fetching weighings:', error);
      throw error;
    }

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching weighings:', error);
    res.status(500).json({
      error: 'Não foi possível carregar as pesagens.',
      code: 'FETCH_ERROR',
    });
  }
});

// POST /api/pesagens
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { animal_id } = req.body;
    const errors: string[] = [];

    // Validação de campos obrigatórios
    if (!animal_id) {
      errors.push('animal_id é obrigatório.');
    }

    if (req.body?.peso === undefined || req.body?.peso === null || req.body?.peso === '') {
      errors.push('O peso é obrigatório.');
    } else {
      const pesoNum = Number(req.body.peso);
      if (Number.isNaN(pesoNum)) {
        errors.push('O peso deve ser um número válido.');
      } else if (pesoNum <= 0) {
        errors.push('O peso deve ser maior que zero.');
      }
    }

    if (!req.body?.data) {
      errors.push('A data da pesagem é obrigatória.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: errors[0],
        details: errors,
        code: 'VALIDATION_ERROR',
      });
    }

    // Verificar que o animal pertence à fazenda
    const { valid } = await verifyAnimalOwnership([animal_id as string], req.fazendaId!);
    if (!valid) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este animal.',
        code: 'UNAUTHORIZED_ACCESS',
      });
    }

    const payload = {
      animal_id: String(animal_id),
      peso: Number(req.body.peso),
      data: req.body.data,
      observacao: req.body.observacao ? String(req.body.observacao).trim() : null,
    };

    const { data, error } = await supabase
      .from('pesagens')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Database error creating weighing:', {
        code: error.code,
        message: error.message,
        payload,
      });

      // Erro de foreign key (animal_id não existe)
      if (error.code === '23503') {
        return res.status(400).json({
          error: 'Animal não encontrado.',
          code: 'ANIMAL_NOT_FOUND',
        });
      }

      throw error;
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Unhandled error creating weighing:', {
      message: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({
      error: 'Não foi possível registrar a pesagem.',
      code: 'INTERNAL_ERROR',
      details:
        process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
});

export default router;
