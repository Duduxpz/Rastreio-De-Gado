import { supabase } from '@/lib/supabase';

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
