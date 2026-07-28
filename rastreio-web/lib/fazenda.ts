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

  // Validação de peso
  if (pesoInformado && Number.isNaN(pesoValue)) {
    throw new Error('Peso deve ser um número válido.');
  }

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
    // Se não conseguir obter URL da API, usaremos fallback Supabase
    apiUrl = '';
  }

  // Tentar via API em primeiro lugar
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

      if (response.ok && data?.id) {
        return data as Animal;
      }

      // Se a resposta foi um erro HTTP, extrair mensagem detalhada
      if (!response.ok) {
        const errorMessage = data?.error || `Erro ${response.status} ao comunicar com a API`;
        // Não falhar aqui, tentar fallback Supabase
        console.warn('API returned error, trying Supabase fallback:', {
          status: response.status,
          error: errorMessage,
        });
      }
    } catch (error) {
      // Erro de rede/timeout, tentar fallback
      console.warn(
        'Falha ao salvar animal via API (possível erro de rede), usando fallback do Supabase:',
        error instanceof Error ? error.message : error
      );
    }
  }

  // Fallback: tentar salvar direto no Supabase
  try {
    const fazendaId = await getCurrentFarmId();
    const { data, error } = await supabase
      .from('animais')
      .insert({ ...payload, fazenda_id: fazendaId })
      .select()
      .single();

    if (error) {
      // Erro específico: migração não aplicada (coluna não existe)
      if (error.code === '42703') {
        throw new Error(
          'Erro de configuração: banco de dados não contém os campos necessários. ' +
          'Entre em contato com o suporte (código: MIGRATION_NOT_APPLIED).'
        );
      }

      // Erro de constraint única
      if (error.code === '23505') {
        throw new Error(`Já existe um animal com o brinco "${payload.brinco}" nesta fazenda.`);
      }

      // Erro genérico
      throw new Error(error.message || 'Não foi possível salvar o animal no banco de dados.');
    }

    return data as Animal;
  } catch (fallbackError) {
    // Re-lançar com contexto
    const message =
      fallbackError instanceof Error ? fallbackError.message : 'Não foi possível salvar o animal.';
    throw new Error(message);
  }
}
