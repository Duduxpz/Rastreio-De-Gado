import { getSessionToken, supabase } from '@/lib/supabase';
import { getBackendUrl } from '@/lib/backend';
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

export async function saveAnimalToSupabase(input: Omit<Partial<Animal>, 'peso_atual'> & { id?: string; brinco: string; nome?: string; categoria?: string; raca?: string; sexo?: string; data_nascimento?: string; peso_atual?: number | string; lote?: string; pasto?: string; especie?: string }) {
  const pesoString = typeof input.peso_atual === 'string' ? input.peso_atual.trim() : '';
  const pesoInformado = input.peso_atual !== undefined && input.peso_atual !== null && pesoString !== '';
  const pesoValue = pesoInformado ? Number(pesoString) : null;
  const payload = {
    id: input.id || crypto.randomUUID(),
    brinco: input.brinco,
    nome: input.nome?.trim() || null,
    especie: input.especie || 'bovino',
    raca: input.raca || null,
    sexo: input.sexo || null,
    data_nascimento: input.data_nascimento || null,
    peso_atual: pesoValue,
    lote: input.lote || null,
    pasto: input.pasto || null,
    categoria: input.categoria || null,
    ativo: true,
    updated_at: new Date().toISOString(),
  };

  const token = await getSessionToken();
  let apiUrl = '';

  try {
    apiUrl = getBackendUrl();
  } catch {
    apiUrl = '';
  }

  if (token && apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/api/animais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return data as Animal;
      }
    } catch (error) {
      console.warn('Falha ao salvar animal via API, usando fallback do Supabase:', error);
    }
  }

  const fazendaId = await getCurrentFarmId();
  const { data, error } = await supabase
    .from('animais')
    .insert({ ...payload, fazenda_id: fazendaId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Não foi possível salvar o animal.');
  }

  return data as Animal;
}
