import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
  fazendaId?: string;
  query: Record<string, any>;
  body: any;
}

function getRequestIp(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.socket.remoteAddress || null;
}

export async function verifyAnimalOwnership(animalIds: string[], fazendaId: string) {
  const uniqueIds = [...new Set(animalIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { valid: true, invalidIds: [], missingIds: [] };
  }

  const { data, error } = await supabase
    .from('animais')
    .select('id, fazenda_id')
    .in('id', uniqueIds);

  if (error) {
    throw error;
  }

  const existing = data || [];
  const missingIds = uniqueIds.filter((id) => !existing.some((item: any) => item.id === id));
  const invalidIds = existing
    .filter((item: any) => item.fazenda_id !== fazendaId)
    .map((item: any) => item.id);

  return {
    valid: invalidIds.length === 0 && missingIds.length === 0,
    invalidIds,
    missingIds,
  };
}

async function createDefaultFazenda(user: any) {
  const nome = user.email ? `Fazenda de ${user.email}` : 'Fazenda do usuário';
  const { data, error } = await supabase
    .from('fazendas')
    .insert({ owner_id: user.id, nome })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create default fazenda for user:', error);
    throw error;
  }

  return data?.id as string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.userId = user.id;

    const { data: farm, error: farmError } = await supabase
      .from('fazendas')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (farmError) {
      console.error('Farm lookup error:', farmError);
      return res.status(500).json({ error: 'Failed to resolve user farm' });
    }

    req.fazendaId = farm?.id ?? (await createDefaultFazenda(user));

    // Audit log
    try {
      await supabase.from('access_logs').insert({
        user_id: user.id,
        fazenda_id: req.fazendaId,
        method: req.method,
        path: req.originalUrl,
        action: `${req.method} ${req.originalUrl}`,
        ip: getRequestIp(req),
      });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Auth error' });
  }
}
