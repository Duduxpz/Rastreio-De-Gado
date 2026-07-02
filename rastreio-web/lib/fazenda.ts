import { getSessionToken, supabase } from '@/lib/supabase';
import type { Animal } from '@/types';

export async function createDefaultFarmForUser(userId: string, nomeFazenda = 'Minha Fazenda') {
  if (!userId) {
    throw new Error('Não foi possível identificar o usuário para criar a fazenda.');
  }

  const { data, error } = await supabase
    .from('fazendas')
    .insert([
      {
        nome: nomeFazenda,
        owner_id: userId,
        plano: 'starter',
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao criar fazenda inicial para o usuário:', error);
    throw new Error('Não foi possível criar a fazenda inicial da conta.');
  }

  return data;
}

export async function getCurrentFarmId() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    throw new Error('Usuário não autenticado.');
  }

  const { data, error } = await supabase
    .from('fazendas')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar fazenda do usuário:', error);
    throw new Error('Não foi possível localizar a fazenda da conta.');
  }

  if (data?.id) {
    return data.id as string;
  }

  return (await createDefaultFarmForUser(user.id)).id as string;
}

export async function saveAnimalToSupabase(input: Partial<Animal> & { id?: string; brinco: string; categoria?: string; raca?: string; sexo?: string; data_nascimento?: string; peso_atual?: number | string; lote?: string; pasto?: string; especie?: string }) {
  const token = await getSessionToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente para continuar.');
  }

  const payload = {
    id: input.id || crypto.randomUUID(),
    brinco: input.brinco,
    raca: input.raca || null,
    sexo: input.sexo || null,
    data_nascimento: input.data_nascimento || null,
    peso_atual: input.peso_atual !== undefined && input.peso_atual !== null && input.peso_atual !== '' ? Number(input.peso_atual) : null,
    lote: input.lote || null,
    pasto: input.pasto || null,
    categoria: input.categoria || null,
    ativo: true,
    updated_at: new Date().toISOString(),
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/animais`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Não foi possível salvar o animal.');
  }

  return data as Animal;
}
