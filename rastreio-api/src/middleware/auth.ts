import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: any;
  fazendaId?: string;
  query: Record<string, any>;
  body: any;
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

    // Get user's farm (assuming one farm per user for simplicity)
    const { data: farm } = await supabase
      .from('fazendas')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!farm) {
      return res.status(403).json({ error: 'No farm found' });
    }

    req.fazendaId = farm.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Auth error' });
  }
}
