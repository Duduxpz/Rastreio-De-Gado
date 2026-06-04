export type Sexo = 'M' | 'F';
export type Categoria = 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi' | 'outro';

export interface Animal {
  id: string;
  fazenda_id: string;
  brinco: string;
  raca?: string;
  sexo?: Sexo;
  data_nascimento?: string;
  peso_atual?: number;
  lote?: string;
  pasto?: string;
  categoria?: Categoria;
  foto_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vacinacao {
  id: string;
  animal_id: string;
  vacina: string;
  data: string;
  dose?: string;
  veterinario?: string;
  proxima_dose?: string;
  created_at: string;
}

export interface Pesagem {
  id: string;
  animal_id: string;
  peso: number;
  data: string;
  observacao?: string;
  created_at: string;
}

export interface Fazenda {
  id: string;
  nome: string;
  owner_id: string;
  plano: 'starter' | 'fazenda' | 'enterprise';
  created_at: string;
}
