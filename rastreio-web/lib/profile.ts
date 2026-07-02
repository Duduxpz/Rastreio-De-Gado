import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  farm_name: string | null;
  created_at: string | null;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, farm_name, created_at')
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
    .select('id, farm_name, created_at')
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
    .select('id, farm_name, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}
