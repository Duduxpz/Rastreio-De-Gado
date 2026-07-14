import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  farm_name: string | null;
  created_at: string | null;
  // Guarda todas as demais preferências da tela de Configurações
  // (responsável, CNPJ, alertas, etc.) em um único JSONB por usuário.
  configuracoes?: Record<string, any> | null;
}

const PROFILE_COLUMNS = 'id, farm_name, created_at, configuracoes';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as UserProfile | null;
}

export async function saveFarmNameForUser(userId: string, farmName: string): Promise<UserProfile> {
  const normalizedFarmName = (farmName || 'Minha Fazenda').trim() || 'Minha Fazenda';

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      [{ id: userId, farm_name: normalizedFarmName }],
      { onConflict: 'id' },
    )
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}

export async function updateProfileFarmName(userId: string, farmName: string): Promise<UserProfile> {
  const normalizedFarmName = (farmName || 'Minha Fazenda').trim() || 'Minha Fazenda';

  const { data, error } = await supabase
    .from('profiles')
    .update({ farm_name: normalizedFarmName })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}

/**
 * Salva TODAS as configurações da tela de Configurações (responsável, CNPJ,
 * cidade/estado, alertas, e-mail de alerta, etc.) no Supabase, além do nome
 * da fazenda. Usa upsert para funcionar tanto na primeira gravação quanto
 * em atualizações seguintes, e assim os dados voltam a aparecer em
 * qualquer login/dispositivo da mesma conta.
 */
export async function saveConfiguracoesForUser(
  userId: string,
  farmName: string,
  configuracoes: Record<string, any>,
): Promise<UserProfile> {
  const normalizedFarmName = (farmName || 'Minha Fazenda').trim() || 'Minha Fazenda';

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      [{ id: userId, farm_name: normalizedFarmName, configuracoes }],
      { onConflict: 'id' },
    )
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}
