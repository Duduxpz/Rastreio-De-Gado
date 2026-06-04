export type Sexo = 'M' | 'F';
export type Categoria = 'bezerro' | 'novilha' | 'vaca' | 'touro' | 'boi' | 'outro';
export type Plano = 'starter' | 'fazenda' | 'enterprise';

export interface Animal {
  id: string;
  fazenda_id: string;
  brinco: string;
  raca?: string;
  sexo?: Sexo;
  data_nascimento?: string; // ISO date string
  peso_atual?: number;
  lote?: string;
  pasto?: string;
  categoria?: Categoria;
  foto_url?: string;
  ativo: boolean;
  updated_at: string;
  synced?: 0 | 1; // apenas no SQLite mobile
}

export interface Vacinacao {
  id: string;
  animal_id: string;
  vacina: string;
  data: string;
  dose?: string;
  veterinario?: string;
  proxima_dose?: string;
  synced?: 0 | 1;
}

export interface Pesagem {
  id: string;
  animal_id: string;
  peso: number;
  data: string;
  observacao?: string;
  synced?: 0 | 1;
}

export interface SyncPayload {
  fazenda_id: string;
  animais: Animal[];
  vacinacoes: Vacinacao[];
  pesagens: Pesagem[];
}
